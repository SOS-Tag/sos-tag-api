import { AssignSheetToUserInput, UpdateSheetInput } from 'dtos/sheet.dto';
import { ISheet, ISheetModel } from '@models/sheet.model';
import { SheetResponse, SheetsResponse } from '@responses/sheet.response';
import { transformSheet } from '@services/utils/transform';
import { isEmpty } from '@utils/object';
import { Inject, Service } from 'typedi';

@Service()
class SheetService {
  constructor(@Inject('SHEET') private readonly sheets: ISheetModel) {}

  async createSheet(sheetId: string): Promise<SheetResponse> {
    const sheetFound = await this.sheets.findById(sheetId);
    if (sheetFound)
      return {
        errors: [
          {
            message: 'Sheet with this id already exists.',
          },
        ],
      };

    const sheet = await this.sheets.create({ _id: sheetId });
    return { response: transformSheet(await sheet.save()) };
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
    });
    return { response: transformSheet(await sheet.save()) };
  }

  async findSheetById(sheetId: string): Promise<SheetResponse> {
    if (isEmpty(sheetId))
      return {
        errors: [
          {
            message: 'Empty userId parameter.',
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

  async findSheets(): Promise<SheetsResponse> {
    const sheets: ISheet[] = await this.sheets.find();
    return { response: sheets.map(sheet => transformSheet(sheet)) };
  }

  async findSheetsByUser(userId: string): Promise<SheetsResponse> {
    const sheets: ISheet[] = await this.sheets.find({ user: userId });
    return { response: sheets.map(sheet => transformSheet(sheet)) };
  }

  async updateSheet(updateSheetInput: UpdateSheetInput, userId: string): Promise<SheetResponse> {
    const sheet = await this.sheets.findOneAndUpdate(
      {
        _id: updateSheetInput.id,
        user: userId,
      },
      updateSheetInput.changes,
      {
        new: true,
      },
    );

    if (!sheet)
      return {
        errors: [
          {
            message: 'Medical sheet not found.',
          },
        ],
      };

    return { response: transformSheet(sheet) };
  }
}

export default SheetService;
