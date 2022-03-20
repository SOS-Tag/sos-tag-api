import { QueryOptions } from '@dtos/common.dto';
import { AssignSheetToUserInput, UpdateUserSheetInput } from '@dtos/sheet.dto';
import Context from '@interfaces/context.interface';
import isAuthenticated from '@middlewares/is-authenticated.middleware';
import isAuthorizedAsAdmin from '@middlewares/is-authorized.middleware';
import { PaginatedSheetsResponse, SheetResponse, SheetsResponse } from '@responses/sheet.response';
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
  @UseMiddleware(isAuthenticated, isAuthorizedAsAdmin)
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
  @UseMiddleware(isAuthenticated)
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

  @Mutation(() => SheetResponse, { description: 'Delete one of the current user sheets.' })
  @UseMiddleware(isAuthenticated)
  async deleteCurrentUserSheet(@Ctx() { payload }: Context, @Arg('sheetId') sheetId: string): Promise<SheetResponse> {
    try {
      const sheet = await this.sheetService.deleteCurrentUserSheet(sheetId, payload.userId);
      return sheet;
    } catch (error) {
      logger.error(`[resolver:Sheet:deleteCurrentUserSheet] ${getErrorMessage(error)}.`);
      throw error;
    }
  }

  @Mutation(() => SheetResponse, { description: 'Update one of the current user sheets.' })
  @UseMiddleware(isAuthenticated)
  async updateCurrentUserSheet(@Ctx() { payload }: Context, @Arg('updateInput') updateInput: UpdateUserSheetInput): Promise<SheetResponse> {
    try {
      const updateCurrentUserSheetResponse = await this.sheetService.updateCurrentUserSheet(updateInput, payload.userId);
      return updateCurrentUserSheetResponse;
    } catch (error) {
      logger.error(`[resolver:Sheet:updateCurrentUserSheet] ${getErrorMessage(error)}.`);
      throw error;
    }
  }

  @Mutation(() => SheetResponse, {
    description:
      'Update a sheet. It requires to be authenticated as an admin because it is not necessarily a sheet that belongs the user that want to apply changes.',
  })
  @UseMiddleware(isAuthenticated, isAuthorizedAsAdmin)
  async updateSheet(@Arg('updateInput') updateInput: UpdateUserSheetInput): Promise<SheetResponse> {
    try {
      const updateSheetResponse = await this.sheetService.updateSheet(updateInput);
      return updateSheetResponse;
    } catch (error) {
      logger.error(`[resolver:Sheet:updateSheet] ${getErrorMessage(error)}.`);
      throw error;
    }
  }

  @Query(() => SheetResponse, { description: 'Get a sheet by its id as an admin.' })
  @UseMiddleware(isAuthenticated, isAuthorizedAsAdmin)
  async Sheet(@Arg('id') id: string): Promise<SheetResponse> {
    try {
      const sheet = await this.sheetService.findSheetById(id);
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
  @UseMiddleware(isAuthenticated)
  async sheetsCurrentUser(@Ctx() { payload }: Context): Promise<SheetsResponse> {
    try {
      const sheets = await this.sheetService.findSheetsByUser(payload.userId);
      return sheets;
    } catch (error) {
      logger.error(`[resolver:Sheet:sheetsCurrentUser] ${getErrorMessage(error)}.`);
      throw error;
    }
  }

  @Query(() => PaginatedSheetsResponse, { description: 'Get all sheets.' })
  @UseMiddleware(isAuthenticated, isAuthorizedAsAdmin)
  async allSheets(@Arg('options') options?: QueryOptions): Promise<PaginatedSheetsResponse> {
    try {
      const sheets = await this.sheetService.findSheets(options || {});
      return sheets;
    } catch (error) {
      logger.error(`[resolver:Sheet:sheets] ${getErrorMessage(error)}.`);
      throw error;
    }
  }
}

export default SheetResolver;
