import { SheetResponse, SheetsResponse } from '@responses/sheet.response';
import { CreateSheetInput, UpdateSheetInput } from '@dtos/sheet.dto';
import SheetSchema from '@schemas/sheet.schema';
import SheetService from '@services/sheet.service';
import { logger } from '@utils/logger';
import { isAuth } from '@middlewares/is-auth.middleware';
import { Arg, Mutation, Query, Resolver, UseMiddleware } from 'type-graphql';
import { Service } from 'typedi';

@Service()
@Resolver(() => SheetSchema)
class SheetResolver {
  constructor(private readonly sheetService: SheetService) {}

  @Mutation(() => SheetResponse, { description: '' })
  async createSheet(@Arg('createSheetInput') createSheetInput: CreateSheetInput): Promise<SheetResponse> {
    try {
      const createSheetResponse = await this.sheetService.createSheet(createSheetInput);
      return createSheetResponse;
    } catch (error) {
      logger.error(`[resolver:Sheet:createSheet] ${error.message}.`);
      throw error;
    }
  }

  @Mutation(() => SheetResponse, { description: '' })
  async updateSheet(@Arg('updateSheetInput') updateSheetInput: UpdateSheetInput): Promise<SheetResponse> {
    try {
      const updateSheetResponse = await this.sheetService.updateSheet(updateSheetInput);
      return updateSheetResponse;
    } catch (error) {
      logger.error(`[resolver:Sheet:updateSheet] ${error.message}.`);
      throw error;
    }
  }

  @Query(() => SheetResponse, { description: '' })
  async sheetById(@Arg('sheetId') sheetId: string): Promise<SheetResponse> {
    try {
      const sheet = await this.sheetService.findSheetById(sheetId);
      return sheet;
    } catch (error) {
      logger.error(`[resolver:Sheet:sheetById] ${error.message}.`);
      throw error;
    }
  }

  @Query(() => SheetsResponse, { description: 'Get all sheets.' })
  @UseMiddleware(isAuth)
  async sheets(): Promise<SheetsResponse> {
    try {
      const sheets = await this.sheetService.findSheets();
      return sheets;
    } catch (error) {
      logger.error(`[resolver:Sheet:sheets] ${error.message}.`);
      throw error;
    }
  }
}

export default SheetResolver;
