import { SheetResponse, SheetsResponse } from '@responses/sheet.response';
import { CreateSheetInput, UpdateSheetInput } from '@dtos/sheet.dto';
import SheetSchema from '@schemas/sheet.schema';
import SheetService from '@services/sheet.service';
import { logger } from '@utils/logger';
import { isAuth } from '@middlewares/is-auth.middleware';
import { Arg, Ctx, Mutation, Query, Resolver, UseMiddleware } from 'type-graphql';
import { Service } from 'typedi';
import Context from '@interfaces/context.interface';

@Service()
@Resolver(() => SheetSchema)
class SheetResolver {
  constructor(private readonly sheetService: SheetService) {}

  @Mutation(() => SheetResponse, { description: 'Create a sheet.' })
  @UseMiddleware(isAuth)
  async createSheet(@Ctx() { payload }: Context, @Arg('createSheetInput') createSheetInput: CreateSheetInput): Promise<SheetResponse> {
    try {
      const createSheetResponse = await this.sheetService.createSheet(createSheetInput, payload.userId);
      return createSheetResponse;
    } catch (error) {
      logger.error(`[resolver:Sheet:createSheet] ${error.message}.`);
      throw error;
    }
  }

  @Mutation(() => SheetResponse, { description: 'Update a sheet.' })
  @UseMiddleware(isAuth)
  async updateSheet(@Ctx() { payload }: Context, @Arg('updateSheetInput') updateSheetInput: UpdateSheetInput): Promise<SheetResponse> {
    try {
      const updateSheetResponse = await this.sheetService.updateSheet(updateSheetInput, payload.userId);
      return updateSheetResponse;
    } catch (error) {
      logger.error(`[resolver:Sheet:updateSheet] ${error.message}.`);
      throw error;
    }
  }

  @Query(() => SheetResponse, { description: 'Get a sheet by its id.' })
  async sheetById(@Arg('sheetId') sheetId: string): Promise<SheetResponse> {
    try {
      const sheet = await this.sheetService.findSheetById(sheetId);
      return sheet;
    } catch (error) {
      logger.error(`[resolver:Sheet:sheetById] ${error.message}.`);
      throw error;
    }
  }

  @Query(() => SheetsResponse, { description: 'Get the sheets of the specified user.' })
  @UseMiddleware(isAuth)
  async sheetsCurrentUser(@Ctx() { payload }: Context): Promise<SheetsResponse> {
    try {
      const sheets = await this.sheetService.findSheetsByUser(payload.userId);
      return sheets;
    } catch (error) {
      logger.error(`[resolver:Sheet:sheetsCurrentUser] ${error.message}.`);
      throw error;
    }
  }

  @Query(() => SheetsResponse, { description: 'Get all sheets.' })
  @UseMiddleware(isAuth) //TODO isAuthenticatedAsAdmin
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
