import { QueryOptions } from '@dtos/common.dto';
import { ISheet, ISheetModel } from '@models/sheet.model';
import { IUserModel } from '@models/user.model';
import { PaginatedSheetsResponse, SheetResponse, SheetsResponse } from '@responses/sheet.response';
import { transformSheet } from '@services/utils/transform';
import { ErrorTypes, generateBadRequestError, generateConflictError, generateFieldErrors, generateNotFoundError } from '@utils/error';
import { denest, isEmpty } from '@utils/object';
import { SortOrder } from '@utils/sort';
import { emptyArgsExist } from '@validators/utils/validate';
import { AssignSheetToUserInput, UpdateCurrentUserSheetInput, UpdateSheetInput } from 'dtos/sheet.dto';
import { customAlphabet } from 'nanoid';
import { Inject, Service } from 'typedi';

const QRCODE_LENGTH = 8;
const customNanoId = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ234578', QRCODE_LENGTH);

@Service()
class SheetService {
  constructor(@Inject('SHEET') private readonly sheets: ISheetModel, @Inject('USER') private readonly users: IUserModel) {}

  async createSheet(count: number): Promise<SheetsResponse> {
    const sheetId = [];
    for (let i = 0; i < count; ++i) {
      let generatedId;
      let docsCount;
      do {
        generatedId = customNanoId();
        docsCount = await this.sheets.countDocuments({ _id: generatedId });
      } while (docsCount > 0);
      sheetId.push(generatedId);
    }

    const sheets = await this.sheets.insertMany(sheetId.map(id => ({ _id: id })));
    return { response: sheets.map(sheet => transformSheet(sheet)) };
  }

  async createSheetsFromIds(ids: string[]): Promise<SheetsResponse> {
    const sheets = await this.sheets.insertMany(ids.map(id => ({ _id: id })));
    return { response: sheets.map(sheet => transformSheet(sheet)) };
  }

  async assignSheetToUser(sheetData: AssignSheetToUserInput, userId: string): Promise<SheetResponse> {
    const sheetFound = await this.sheets.findById(sheetData.id);
    if (!sheetFound) return { error: generateNotFoundError(ErrorTypes.sheetNotFound, 'This sheet does not exist.') };
    if (sheetFound.user) return { error: generateConflictError(ErrorTypes.sheetAlreadyAssigned, 'This sheet is already assigned to a user.') };

    const sheet = sheetFound;
    sheet.set({
      ...sheetData,
      user: userId,
      enabled: true,
    });
    return { response: transformSheet(await sheet.save()) };
  }

  async deleteCurrentUserSheet(sheetId: string, userId: string): Promise<SheetResponse> {
    const emptyArgs = emptyArgsExist({ sheetId });
    if (!isEmpty(emptyArgs))
      return { error: generateBadRequestError(ErrorTypes.emptyArgs, 'The sheetId is missing.', generateFieldErrors(emptyArgs)) };

    await this.sheets.deleteOne({
      _id: sheetId,
      user: userId,
    });
    return { response: { _id: sheetId } };
  }

  async deleteSheet(sheetId: string): Promise<SheetResponse> {
    const emptyArgs = emptyArgsExist({ sheetId });
    if (!isEmpty(emptyArgs))
      return { error: generateBadRequestError(ErrorTypes.emptyArgs, 'The sheetId is missing.', generateFieldErrors(emptyArgs)) };

    await this.sheets.findByIdAndDelete(sheetId);
    return { response: { _id: sheetId } };
  }

  async findSheetById(sheetId: string): Promise<SheetResponse> {
    const emptyArgs = emptyArgsExist({ sheetId });
    if (!isEmpty(emptyArgs))
      return { error: generateBadRequestError(ErrorTypes.emptyArgs, 'The sheetId is missing.', generateFieldErrors(emptyArgs)) };

    const sheet = await this.sheets.findById(sheetId);
    if (!sheet) return { error: generateNotFoundError(ErrorTypes.sheetNotFound, 'This sheet does not exist.') };

    return { response: transformSheet(sheet) };
  }

  async sheetByScanning(sheetId: string): Promise<SheetResponse> {
    const emptyArgs = emptyArgsExist({ sheetId });
    if (!isEmpty(emptyArgs))
      return { error: generateBadRequestError(ErrorTypes.emptyArgs, 'The sheetId is missing.', generateFieldErrors(emptyArgs)) };

    const sheet = await this.sheets.findOne({ _id: sheetId, enabled: true });
    if (!sheet || !sheet.user) return { error: generateNotFoundError(ErrorTypes.sheetNotFound, 'This sheet does not exist.') };

    const user = await this.users.findById(sheet.user);
    if (!user || !user.activated) return { error: generateNotFoundError(ErrorTypes.sheetNotFound, 'This sheet does not exist.') };

    return { response: transformSheet(sheet) };
  }

  async findSheets({ filter, pagination, sort }: QueryOptions): Promise<PaginatedSheetsResponse> {
    const sheets: ISheet[] = await this.sheets
      .find(filter && { [filter.field]: { $regex: filter.value } })
      .limit(pagination?.limit * 1 || 0)
      .skip((pagination?.page - 1) * pagination?.limit || 0)
      .sort(sort && { [sort.field]: sort.order === SortOrder.ascending ? 1 : -1 })
      .exec();

    let totalItems = 0;

    if (!isEmpty(filter)) {
      const matchedSheets = await this.sheets.find({ [filter.field]: { $regex: filter.value } });
      totalItems = matchedSheets.length;
    } else {
      totalItems = await this.sheets.countDocuments();
    }

    const totalPages = Math.ceil(totalItems / pagination?.limit) || 1;
    const currentPage = pagination?.page || 1;
    const hasMore = pagination?.page < totalPages || false;

    return {
      response: {
        items: sheets.map(sheet => transformSheet(sheet)),
        totalItems,
        totalPages,
        currentPage,
        hasMore,
      },
    };
  }

  async findSheetsByUser(userId: string): Promise<SheetsResponse> {
    const sheets: ISheet[] = await this.sheets.find({ user: userId });
    return { response: sheets.map(sheet => transformSheet(sheet)) };
  }

  async updateCurrentUserSheet(updateSheetInput: UpdateCurrentUserSheetInput, userId: string): Promise<SheetResponse> {
    const sheet = await this.sheets.findOneAndUpdate(
      {
        _id: updateSheetInput.id,
        user: userId,
      },
      denest(updateSheetInput.changes),
      {
        new: true,
      },
    );

    if (!sheet) return { error: generateNotFoundError(ErrorTypes.sheetNotFound, 'This sheet does not exist.') };

    return { response: transformSheet(sheet) };
  }

  async updateSheet(updateSheetInput: UpdateSheetInput): Promise<SheetResponse> {
    const sheet = await this.sheets.findOneAndUpdate(
      {
        _id: updateSheetInput.id,
      },
      denest(updateSheetInput.changes),
      {
        new: true,
      },
    );

    if (!sheet) return { error: generateNotFoundError(ErrorTypes.sheetNotFound, 'This sheet does not exist.') };

    return { response: transformSheet(sheet) };
  }
}

export { customNanoId, QRCODE_LENGTH };
export default SheetService;
