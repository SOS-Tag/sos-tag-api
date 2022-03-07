import { AssignSheetToUserInput, UpdateCurrentUserSheetInput } from 'dtos/sheet.dto';
import { ISheet, ISheetModel } from '@models/sheet.model';
import { IUserModel } from '@models/user.model';
import { SheetResponse, SheetsResponse } from '@responses/sheet.response';
import { transformSheet } from '@services/utils/transform';
import { isEmpty, denest } from '@utils/object';
import { Inject, Service } from 'typedi';
import { customNanoId } from './qrcode.service';

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

  async assignSheetToUser(sheetData: AssignSheetToUserInput, userId: string): Promise<SheetResponse> {
    const sheetFound = await this.sheets.findById(sheetData.id);
    if (!sheetFound)
      return {
        errors: [
          {
            message: 'Sheet not found.',
          },
        ],
      };

    if (sheetFound.user)
      return {
        errors: [
          {
            message: 'Sheet with this id is already assigned to a user.',
          },
        ],
      };

    const sheet = sheetFound;
    sheet.set({
      ...sheetData,
      user: userId,
      enabled: true,
    });
    return { response: transformSheet(await sheet.save()) };
  }

  async findSheetById(sheetId: string): Promise<SheetResponse> {
    if (isEmpty(sheetId))
      return {
        errors: [
          {
            message: 'Empty sheetId parameter.',
          },
        ],
      };

    const sheet = await this.sheets.findById(sheetId);
    if (!sheet)
      return {
        errors: [
          {
            message: 'Sheet not found.',
          },
        ],
      };

    return { response: transformSheet(sheet) };
  }

  async sheetByScanning(sheetId: string): Promise<SheetResponse> {
    if (isEmpty(sheetId))
      return {
        errors: [
          {
            message: 'Empty sheetId parameter.',
          },
        ],
      };

    const sheet = await this.sheets.findOne({ _id: sheetId, enabled: true });
    if (!sheet || !sheet.user)
      return {
        errors: [
          {
            message: 'Sheet not found.',
          },
        ],
      };

    const user = await this.users.findById(sheet.user);
    if (!user || !user.activated)
      return {
        errors: [
          {
            message: 'Sheet not found.',
          },
        ],
      };

    return { response: transformSheet(sheet) };
  }

  async findSheets(): Promise<SheetsResponse> {
    const sheets: ISheet[] = await this.sheets.find();
    return { response: sheets.map(sheet => transformSheet(sheet)) };
  }

  async findSheetsByUser(userId: string): Promise<SheetsResponse> {
    const sheets: ISheet[] = await this.sheets.find({ user: userId });
    return { response: sheets.map(sheet => transformSheet(sheet)) };
  }

  async updateCurrentUserSheet(updateCurrentUserSheetInput: UpdateCurrentUserSheetInput, userId: string): Promise<SheetResponse> {
    const sheet = await this.sheets.findOneAndUpdate(
      {
        _id: updateCurrentUserSheetInput.id,
        user: userId,
      },
      denest(updateCurrentUserSheetInput.changes),
      {
        new: true,
      },
    );

    if (!sheet)
      return {
        errors: [
          {
            message: 'Sheet not found.',
          },
        ],
      };

    return { response: transformSheet(sheet) };
  }
}

export default SheetService;
