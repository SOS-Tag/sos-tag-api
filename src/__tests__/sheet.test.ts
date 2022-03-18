import faker from '@faker-js/faker';
import { IUser } from '@models/user.model';
import { ErrorTypes } from '@utils/error';
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

let registeredAdmin: (IUser & { _id: string }) | null = null;
let adminAccessToken: string | undefined = undefined;

let accessToken: string | undefined = undefined;
let registeredUser: (IUser & { _id: string }) | null = null;

let sheetId;

beforeAll(async () => {
  await createConnection();

  const admin = {
    fname: faker.name.firstName(),
    lname: faker.name.lastName(),
    email: faker.internet.email().toLowerCase(),
    phone: faker.phone.phoneNumber('07########'),
  };
  const adminPassword = 'k"KM@2#x';

  registeredAdmin = await registerTestUser(admin, adminPassword, ['admin']);

  adminAccessToken = await logTestUserIn({
    email: registeredAdmin.email,
    password: adminPassword,
  });

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

      const error = response.data.sheets.error;

      expect(response.data.sheets.response).toBeNull();
      expect(error.type).toEqual(ErrorTypes.unauthenticated);
      expect(error.code).toEqual(401);
      expect(error.title).toEqual('Unauthorized');
      expect(error.message).toEqual('You need to be authenticated to access the requested resource.');
      expect(error.fields).toBeNull();
    });

    test('unsuccessful when user is not authorized', async () => {
      const response = await graphqlTestCall(SHEETS, undefined, accessToken);

      const error = response.data.sheets.error;

      expect(response.data.sheets.response).toBeNull();
      expect(error.type).toEqual(ErrorTypes.unauthorized);
      expect(error.code).toEqual(401);
      expect(error.title).toEqual('Unauthorized');
      expect(error.message).toEqual('You need to be authenticated and authorized to access the requested resource.');
      expect(error.fields).toBeNull();
    });

    test('successful when user is logged in', async () => {
      const response = await graphqlTestCall(SHEETS, undefined, adminAccessToken);

      const data = response.data.sheets.response;
      const error = response.data.sheets.error;

      expect(error).toBeNull();
      expect(data).toBeInstanceOf(Array);
    });
  });
  describe('Retrieve from current user', () => {
    test('unsuccessful when no user is currently logged in', async () => {
      const response = await graphqlTestCall(SHEETS_CURRENT_USER);

      const error = response.data.sheetsCurrentUser.error;

      expect(response.data.sheetsCurrentUser.response).toBeNull();
      expect(error.type).toEqual(ErrorTypes.unauthenticated);
      expect(error.code).toEqual(401);
      expect(error.title).toEqual('Unauthorized');
      expect(error.message).toEqual('You need to be authenticated to access the requested resource.');
      expect(error.fields).toBeNull();
    });

    test('successful when a user is logged in', async () => {
      const response = await graphqlTestCall(SHEETS_CURRENT_USER, undefined, accessToken);

      const data = response.data.sheetsCurrentUser.response;
      const error = response.data.sheetsCurrentUser.error;

      expect(error).toBeNull();
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

      const error = response.data.createSheet.error;

      expect(response.data.createSheet.response).toBeNull();
      expect(error.type).toEqual(ErrorTypes.unauthenticated);
      expect(error.code).toEqual(401);
      expect(error.title).toEqual('Unauthorized');
      expect(error.message).toEqual('You need to be authenticated to access the requested resource.');
      expect(error.fields).toBeNull();
    });

    test('unsuccessful user is not authorized', async () => {
      const response = await graphqlTestCall(
        CREATE_SHEET,
        {
          count: 1,
        },
        accessToken,
      );

      const error = response.data.createSheet.error;

      expect(response.data.createSheet.response).toBeNull();
      expect(error.type).toEqual(ErrorTypes.unauthorized);
      expect(error.code).toEqual(401);
      expect(error.title).toEqual('Unauthorized');
      expect(error.message).toEqual('You need to be authenticated and authorized to access the requested resource.');
      expect(error.fields).toBeNull();
    });

    test('successful when a user is logged in', async () => {
      const response = await graphqlTestCall(
        CREATE_SHEET,
        {
          count: 1,
        },
        adminAccessToken,
      );

      const data = response.data.createSheet.response;
      const error = response.data.createSheet.error;

      expect(error).toBeNull();
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

      const error = response.data.assignSheetToUser.error;

      expect(response.data.assignSheetToUser.response).toBeNull();
      expect(error.type).toEqual(ErrorTypes.unauthenticated);
      expect(error.code).toEqual(401);
      expect(error.title).toEqual('Unauthorized');
      expect(error.message).toEqual('You need to be authenticated to access the requested resource.');
      expect(error.fields).toBeNull();
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
      const error = response.data.assignSheetToUser.error;

      expect(error).toBeNull();
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

      const error = response.data.assignSheetToUser.error;

      expect(response.data.assignSheetToUser.response).toBeNull();
      expect(error.type).toEqual(ErrorTypes.sheetNotFound);
      expect(error.code).toEqual(404);
      expect(error.title).toEqual('Not found');
      expect(error.message).toEqual('This sheet does not exist.');
      expect(error.fields).toBeNull();
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

      const error = response.data.assignSheetToUser.error;

      expect(response.data.assignSheetToUser.response).toBeNull();
      expect(error.type).toEqual(ErrorTypes.sheetAlreadyAssigned);
      expect(error.code).toEqual(409);
      expect(error.title).toEqual('Conflict');
      expect(error.message).toEqual('This sheet is already assigned to a user.');
      expect(error.fields).toBeNull();
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

      const error = response.data.sheetById.error;

      expect(response.data.sheetById.response).toBeNull();
      expect(error.type).toEqual(ErrorTypes.unauthenticated);
      expect(error.code).toEqual(401);
      expect(error.title).toEqual('Unauthorized');
      expect(error.message).toEqual('You need to be authenticated to access the requested resource.');
      expect(error.fields).toBeNull();
    });

    test('unsuccessful when user is not authorized', async () => {
      const response = await graphqlTestCall(
        SHEET_BY_ID,
        {
          sheetId,
        },
        accessToken,
      );

      const error = response.data.sheetById.error;

      expect(response.data.sheetById.response).toBeNull();
      expect(error.type).toEqual(ErrorTypes.unauthorized);
      expect(error.code).toEqual(401);
      expect(error.title).toEqual('Unauthorized');
      expect(error.message).toEqual('You need to be authenticated and authorized to access the requested resource.');
      expect(error.fields).toBeNull();
    });

    test('unsuccessful with empty ID parameter', async () => {
      const response = await graphqlTestCall(
        SHEET_BY_ID,
        {
          sheetId: null,
        },
        adminAccessToken,
      );

      const data = response.data.sheetById.response;
      const error = response.data.sheetById.error;

      expect(data).toBeNull();
      expect(error.type).toEqual(ErrorTypes.emptyArgs);
      expect(error.code).toEqual(400);
      expect(error.title).toEqual('Bad request');
      expect(error.message).toEqual('The sheetId is missing.');
      expect(error.timestamp).toBeDefined();
    });

    test('unsuccessful with unexisting ID in database', async () => {
      const response = await graphqlTestCall(
        SHEET_BY_ID,
        {
          sheetId: 'AAAAAAAA',
        },
        adminAccessToken,
      );

      const data = response.data.sheetById.response;
      const error = response.data.sheetById.error;

      expect(data).toBeNull();
      expect(error.type).toEqual(ErrorTypes.sheetNotFound);
      expect(error.code).toEqual(404);
      expect(error.title).toEqual('Not found');
      expect(error.message).toEqual('This sheet does not exist.');
      expect(error.fields).toBeNull();
    });

    test('successful', async () => {
      const response = await graphqlTestCall(
        SHEET_BY_ID,
        {
          sheetId,
        },
        adminAccessToken,
      );

      const data = response.data.sheetById.response;
      const error = response.data.sheetById.error;

      expect(error).toBeNull();
      expect(data._id).toEqual(sheetId);
    });
  });
  describe('Retrieve by scanning', () => {
    test('unsuccessful with empty ID parameter', async () => {
      const response = await graphqlTestCall(SHEET_BY_SCANNING, {
        sheetId: null,
      });

      const data = response.data.sheetByScanning.response;
      const error = response.data.sheetByScanning.error;

      expect(data).toBeNull();
      expect(error.type).toEqual(ErrorTypes.emptyArgs);
      expect(error.code).toEqual(400);
      expect(error.title).toEqual('Bad request');
      expect(error.message).toEqual('The sheetId is missing.');
      expect(error.timestamp).toBeDefined();
    });

    test('unsuccessful with unexisting ID in database', async () => {
      const response = await graphqlTestCall(SHEET_BY_SCANNING, {
        sheetId: 'AAAAAAAA',
      });

      const data = response.data.sheetByScanning.response;
      const error = response.data.sheetByScanning.error;

      expect(data).toBeNull();
      expect(error.type).toEqual(ErrorTypes.sheetNotFound);
      expect(error.code).toEqual(404);
      expect(error.title).toEqual('Not found');
      expect(error.message).toEqual('This sheet does not exist.');
      expect(error.fields).toBeNull();
    });

    test('successful', async () => {
      const response = await graphqlTestCall(SHEET_BY_SCANNING, {
        sheetId: sheetId,
      });

      const data = response.data.sheetByScanning.response;
      const error = response.data.sheetByScanning.error;

      expect(error).toBeNull();
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

      const error = response.data.updateCurrentUserSheet.error;

      expect(response.data.updateCurrentUserSheet.response).toBeNull();
      expect(error.type).toEqual(ErrorTypes.unauthenticated);
      expect(error.code).toEqual(401);
      expect(error.title).toEqual('Unauthorized');
      expect(error.message).toEqual('You need to be authenticated to access the requested resource.');
      expect(error.fields).toBeNull();
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
      const error = response.data.updateCurrentUserSheet.error;

      expect(data).toBeNull();
      expect(error.type).toEqual(ErrorTypes.sheetNotFound);
      expect(error.code).toEqual(404);
      expect(error.title).toEqual('Not found');
      expect(error.message).toEqual('This sheet does not exist.');
      expect(error.fields).toBeNull();
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
      const error = response.data.updateCurrentUserSheet.error;

      expect(error).toBeNull();
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
      const error = response.data.updateCurrentUserSheet.error;

      expect(error).toBeNull();
      expect(data).toEqual({
        enabled: true,
        ...newSheetData,
        ...sheetDataChanges,
        treatingDoctor: {
          ...newSheetData.treatingDoctor,
          ...sheetDataChanges.treatingDoctor,
        },
        emergencyContacts: sheetDataChanges.emergencyContacts,
      });
    });
  });
});
