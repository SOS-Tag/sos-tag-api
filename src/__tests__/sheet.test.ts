import { IUser } from '@models/user.model';
import { createConnection } from '@utils/mongoose';
import {
  ASSIGN_SHEET_TO_USER,
  CREATE_SHEET,
  SHEETS,
  SHEETS_CURRENT_USER,
  SHEET_BY_ID,
  SHEET_BY_SCANNING,
  UPDATE_SHEET,
} from '@__tests__/utils/graphql/sheet.graphql';
import { initialUserData, newSheetData, sheetDataChanges, password } from '@__tests__/utils/mock-data';
import { graphqlTestCall, logTestUserIn, registerTestUser, teardown } from '@__tests__/utils/set-up';

let accessToken: string | undefined = undefined;
let registeredUser: (IUser & { _id: string }) | null = null;

let sheetId;

beforeAll(async () => {
  await createConnection();

  registeredUser = await registerTestUser(initialUserData, password);

  accessToken = await logTestUserIn({
    email: registeredUser.email,
    password,
  });
});

afterAll(async () => {
  await teardown();
});

describe('Medical sheets service', () => {
  describe('Retrieve all', () => {
    test('unsuccessful when user is not logged in', async () => {
      const response = await graphqlTestCall(SHEETS);
      const [error] = response.errors;
      expect(response.data.sheets).toBeNull();
      expect(error.message).toEqual('Unauthenticated');
    });
    test('successful when user is logged in', async () => {
      const response = await graphqlTestCall(SHEETS, undefined, accessToken);
      const data = response.data.sheets.response;
      const errors = response.data.sheets.errors;
      expect(errors).toBeNull();
      expect(data).toBeInstanceOf(Array);
    });
  });
  describe('Retrieve from current user', () => {
    test('unsuccessful when no user is currently logged in', async () => {
      const response = await graphqlTestCall(SHEETS_CURRENT_USER);
      const [error] = response.errors;
      expect(response.data.sheetsCurrentUser).toBeNull();
      expect(error.message).toEqual('Unauthenticated');
    });
    test('successful when a user is logged in', async () => {
      const response = await graphqlTestCall(SHEETS_CURRENT_USER, undefined, accessToken);
      const data = response.data.sheetsCurrentUser.response;
      const errors = response.data.sheetsCurrentUser.errors;
      expect(errors).toBeNull();
      expect(data).toBeInstanceOf(Array);
    });
  });
  describe('Create new', () => {
    test('unsuccessful when no user is currently logged in', async () => {
      const response = await graphqlTestCall(
        CREATE_SHEET,
        {
          count: 1,
        },
        undefined,
      );
      const [error] = response.errors;
      expect(response.data.createSheet).toBeNull();
      expect(error.message).toEqual('Unauthenticated');
    });
    test('successful when a user is logged in', async () => {
      const response = await graphqlTestCall(
        CREATE_SHEET,
        {
          count: 1,
        },
        accessToken,
      );
      const data = response.data.createSheet.response;
      const errors = response.data.createSheet.errors;
      expect(errors).toBeNull();
      expect(typeof data[0]._id).toBe('string');
      sheetId = data[0]._id;
    });
  });
  describe('Assign to user', () => {
    test('unsuccessful when no user is currently logged in', async () => {
      const response = await graphqlTestCall(
        ASSIGN_SHEET_TO_USER,
        {
          assignSheetToUserInput: {
            id: sheetId,
          },
        },
        undefined,
      );
      const [error] = response.errors;
      expect(response.data.assignSheetToUser).toBeNull();
      expect(error.message).toEqual('Unauthenticated');
    });
    test('successful when a user is logged in', async () => {
      const response = await graphqlTestCall(
        ASSIGN_SHEET_TO_USER,
        {
          assignSheetToUserInput: {
            id: sheetId,
          },
        },
        accessToken,
      );
      const data = response.data.assignSheetToUser.response;
      const errors = response.data.assignSheetToUser.errors;
      expect(errors).toBeNull();
      expect(data).toEqual({
        _id: sheetId,
        enabled: true,
        user: registeredUser.id,
      });
    });
    test('unsuccessful with unexisting ID in database', async () => {
      const response = await graphqlTestCall(
        ASSIGN_SHEET_TO_USER,
        {
          assignSheetToUserInput: {
            id: 'AAAAAAAA',
          },
        },
        accessToken,
      );
      const [error] = response.data.assignSheetToUser.errors;
      expect(response.data.assignSheetToUser.response).toBeNull();
      expect(error.message).toEqual('Sheet not found.');
    });
    test('unsuccessful when sheet is already assigned to a user', async () => {
      const response = await graphqlTestCall(
        ASSIGN_SHEET_TO_USER,
        {
          assignSheetToUserInput: {
            id: sheetId,
          },
        },
        accessToken,
      );
      const [error] = response.data.assignSheetToUser.errors;
      expect(response.data.assignSheetToUser.response).toBeNull();
      expect(error.message).toEqual('Sheet with this id is already assigned to a user.');
    });
  });
  describe('Retrieve by ID', () => {
    test('unsuccessful when user is not authenticated', async () => {
      const response = await graphqlTestCall(
        SHEET_BY_ID,
        {
          sheetId,
        },
        undefined,
      );
      const [error] = response.errors;
      expect(response.data.sheetById).toBeNull();
      expect(error.message).toEqual('Unauthenticated');
    });
    test('unsuccessful with empty ID parameter', async () => {
      const response = await graphqlTestCall(
        SHEET_BY_ID,
        {
          sheetId: null,
        },
        accessToken,
      );
      const data = response.data.sheetById.response;
      const [error] = response.data.sheetById.errors;
      expect(data).toBeNull();
      expect(error.message).toEqual('Empty sheetId parameter.');
    });
    test('unsuccessful with unexisting ID in database', async () => {
      const response = await graphqlTestCall(
        SHEET_BY_ID,
        {
          sheetId: 'AAAAAAAA',
        },
        accessToken,
      );
      const data = response.data.sheetById.response;
      const [error] = response.data.sheetById.errors;
      expect(data).toBeNull();
      expect(error.message).toEqual('Sheet not found.');
    });
    test('successful', async () => {
      const response = await graphqlTestCall(
        SHEET_BY_ID,
        {
          sheetId,
        },
        accessToken,
      );
      const data = response.data.sheetById.response;
      const errors = response.data.sheetById.errors;
      expect(errors).toBeNull();
      expect(data._id).toEqual(sheetId);
    });
  });
  describe('Retrieve by scanning', () => {
    test('unsuccessful with empty ID parameter', async () => {
      const response = await graphqlTestCall(SHEET_BY_SCANNING, {
        sheetId: null,
      });
      const data = response.data.sheetByScanning.response;
      const [error] = response.data.sheetByScanning.errors;
      expect(data).toBeNull();
      expect(error.message).toEqual('Empty sheetId parameter.');
    });
    test('unsuccessful with unexisting ID in database', async () => {
      const response = await graphqlTestCall(SHEET_BY_SCANNING, {
        sheetId: 'AAAAAAAA',
      });
      const data = response.data.sheetByScanning.response;
      const [error] = response.data.sheetByScanning.errors;
      expect(data).toBeNull();
      expect(error.message).toEqual('Sheet not found.');
    });
    test('successful', async () => {
      const response = await graphqlTestCall(SHEET_BY_SCANNING, {
        sheetId: sheetId,
      });
      const data = response.data.sheetByScanning.response;
      const errors = response.data.sheetByScanning.errors;
      expect(errors).toBeNull();
      expect(data._id).toEqual(sheetId);
    });
  });
  describe('Update #1', () => {
    test('unsuccessfull with a user not logged in', async () => {
      const response = await graphqlTestCall(
        UPDATE_SHEET,
        {
          updateCurrentUserSheetInput: {
            id: sheetId,
            changes: {
              ...newSheetData,
            },
          },
        },
        undefined,
      );
      const data = response.data.updateCurrentUserSheet;
      const [error] = response.errors;
      expect(data).toBeNull();
      expect(error.message).toEqual('Unauthenticated');
    });
    test('unsuccessfull with an unassigned ID or an ID referencing a sheet that does not belong to the current user', async () => {
      const response = await graphqlTestCall(
        UPDATE_SHEET,
        {
          updateCurrentUserSheetInput: {
            id: `UNKNOWN:${sheetId}`,
            changes: {
              ...newSheetData,
            },
          },
        },
        accessToken,
      );
      const data = response.data.updateCurrentUserSheet.response;
      const [error] = response.data.updateCurrentUserSheet.errors;
      expect(data).toBeNull();
      expect(error.message).toEqual('Sheet not found.');
    });
    test('successful with a user logged in, and a valid medical sheet id that belongs to this user', async () => {
      const response = await graphqlTestCall(
        UPDATE_SHEET,
        {
          updateCurrentUserSheetInput: {
            id: sheetId,
            changes: {
              ...newSheetData,
            },
          },
        },
        accessToken,
      );
      const data = response.data.updateCurrentUserSheet.response;
      const errors = response.data.updateCurrentUserSheet.errors;
      expect(errors).toBeNull();
      expect(data).toEqual({
        enabled: true,
        ...newSheetData,
      });
    });
  });
  describe('Update #2', () => {
    test('successful', async () => {
      const response = await graphqlTestCall(
        UPDATE_SHEET,
        {
          updateCurrentUserSheetInput: {
            id: sheetId,
            changes: {
              ...sheetDataChanges,
            },
          },
        },
        accessToken,
      );
      const data = response.data.updateCurrentUserSheet.response;
      const errors = response.data.updateCurrentUserSheet.errors;
      expect(errors).toBeNull();
      expect(data).toEqual({
        enabled: true,
        ...newSheetData,
        ...sheetDataChanges,
        treatingDoctor: {
          ...newSheetData.treatingDoctor,
          ...sheetDataChanges.treatingDoctor,
        },
      });
    });
  });
});
