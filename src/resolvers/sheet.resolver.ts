import { AssignSheetToUserInput, UpdateSheetInput } from '@dtos/sheet.dto';
import Context from '@interfaces/context.interface';
import isAuth from '@middlewares/is-auth.middleware';
import { SheetResponse, SheetsResponse } from '@responses/sheet.response';
import SheetSchema from '@schemas/sheet.schema';
import SheetService from '@services/sheet.service';
import { getErrorMessage } from '@utils/error';
import { logger } from '@utils/logger';
import { Arg, Ctx, Mutation, Query, Resolver, UseMiddleware } from 'type-graphql';
import { Service } from 'typedi';

@Service()
@Resolver(() => SheetSchema)
class SheetResolver {
  constructor(private readonly sheetService: SheetService) {}

  @Mutation(() => SheetsResponse, { description: 'Create an empty sheet.' })
  @UseMiddleware(isAuth) //TODO isAuthenticatedAsAdmin
  async createSheet(@Arg('count') count: number): Promise<SheetsResponse> {
    try {
      const createSheetResponse = await this.sheetService.createSheet(count);
      return createSheetResponse;
    } catch (error) {
      logger.error(`[resolver:Sheet:createSheet] ${getErrorMessage(error)}.`);
      throw error;
    }
  }

  @Mutation(() => SheetResponse, { description: 'Assign an unassigned sheet to the current user.' })
  @UseMiddleware(isAuth)
  async assignSheetToUser(
    @Ctx() { payload }: Context,
    @Arg('assignSheetToUserInput') assignSheetToUserInput: AssignSheetToUserInput,
  ): Promise<SheetResponse> {
    try {
      const assignSheetToUserResponse = await this.sheetService.assignSheetToUser(assignSheetToUserInput, payload.userId);
      return assignSheetToUserResponse;
    } catch (error) {
      logger.error(`[resolver:Sheet:assignSheetToUser] ${getErrorMessage(error)}.`);
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
      logger.error(`[resolver:Sheet:updateSheet] ${getErrorMessage(error)}.`);
      throw error;
    }
  }

  @Query(() => SheetResponse, { description: 'Get a sheet by its id as an admin.' })
  @UseMiddleware(isAuth) //TODO isAuthenticatedAsAdmin
  async sheetById(@Arg('sheetId') sheetId: string): Promise<SheetResponse> {
    try {
      const sheet = await this.sheetService.findSheetById(sheetId);
      return sheet;
    } catch (error) {
      logger.error(`[resolver:Sheet:sheetById] ${getErrorMessage(error)}.`);
      throw error;
    }
  }

  @Query(() => SheetResponse, { description: 'Get an active sheet by its id.' })
  async sheetByScanning(@Arg('sheetId') sheetId: string): Promise<SheetResponse> {
    try {
      const sheet = await this.sheetService.sheetByScanning(sheetId);
      return sheet;
    } catch (error) {
      logger.error(`[resolver:Sheet:sheetByScanning] ${getErrorMessage(error)}.`);
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
      logger.error(`[resolver:Sheet:sheetsCurrentUser] ${getErrorMessage(error)}.`);
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
      logger.error(`[resolver:Sheet:sheets] ${getErrorMessage(error)}.`);
      throw error;
    }
  }
}

export default SheetResolver;
