import message from '@locales/en/translation.json';
import { createConnection } from '@utils/mongoose';
import { LOGIN } from './utils/graphql/auth.graphql';
import { CREATE_SHEET, SHEETS, SHEETS_CURRENT_USER, SHEET_BY_ID, UPDATE_SHEET } from './utils/graphql/sheet.graphql';
import { customId, initialUserData, newSheetData, password } from './utils/mock-data';
import { createTestUser, graphqlTestCall, teardown } from './utils/setup';

let accessToken: string | undefined = undefined;

beforeAll(async () => {
  await createConnection();
  const registeredUser = await createTestUser(initialUserData, password);

  const loginInput = {
    email: registeredUser.email,
    password,
  };
  const response = await graphqlTestCall(LOGIN, { loginInput });

  accessToken = response.data.login.response.accessToken;
});

afterAll(async () => {
  await teardown();
});

describe('Medical sheets service', () => {
  describe('Retrieve all', () => {
    test('unsuccessful when user is not logged in', async () => {
      const response = await graphqlTestCall(SHEETS, undefined);
      const error = response.errors[0];
      expect(response.data.sheets).toBeNull();
      expect(error.message).toEqual(message.auth.unauthorized);
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
      const response = await graphqlTestCall(SHEETS_CURRENT_USER, undefined);
      const error = response.errors[0];
      expect(response.data.sheetsCurrentUser).toBeNull();
      expect(error.message).toEqual(message.auth.unauthorized);
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
          createSheetInput: {
            ...newSheetData,
            id: customId,
          },
        },
        undefined,
      );
      const error = response.errors[0];
      expect(response.data.createSheet).toBeNull();
      expect(error.message).toEqual(message.auth.unauthorized);
    });
    test('successful when a user is logged in', async () => {
      const response = await graphqlTestCall(
        CREATE_SHEET,
        {
          createSheetInput: {
            ...newSheetData,
            id: customId,
          },
        },
        accessToken,
      );
      const data = response.data.createSheet.response;
      const errors = response.data.createSheet.errors;
      expect(errors).toBeNull();
      expect(data).toEqual({
        ...newSheetData,
        _id: customId,
      });
    });
  });
  describe('Retrieve by ID', () => {
    test('unsuccessful with empty ID parameter', async () => {
      const response = await graphqlTestCall(SHEET_BY_ID, {
        sheetId: null,
      });
      const data = response.data.sheetById.response;
      const error = response.data.sheetById.errors[0];
      expect(data).toBeNull();
      expect(error.message).toEqual('Empty userId parameter.');
    });
    test('unsuccessful with unexisting ID in database', async () => {
      const response = await graphqlTestCall(SHEET_BY_ID, {
        sheetId: 'AAAAAAAA',
      });
      const data = response.data.sheetById.response;
      const error = response.data.sheetById.errors[0];
      expect(data).toBeNull();
      expect(error.message).toEqual('Medical sheet not found.');
    });
    test('successful with unexisting ID in database', async () => {
      const response = await graphqlTestCall(SHEET_BY_ID, {
        sheetId: customId,
      });
      const data = response.data.sheetById.response;
      const errors = response.data.sheetById.errors;
      expect(errors).toBeNull();
      expect(data).toEqual({
        ...newSheetData,
        _id: customId,
      });
    });
  });
  describe('Update', () => {
    const newBloodType = 'A+';
    if (newBloodType === newSheetData.bloodType) {
      throw new Error(
        'To perform the update on the sheet, you tried to update a value with the same value as the old one. In the context of a test, this does not make sense and cannot ensure a valid result.',
      );
    }

    test('unsuccessfull with a user not logged in', async () => {
      const response = await graphqlTestCall(
        UPDATE_SHEET,
        {
          updateSheetInput: {
            id: customId,
            changes: {
              bloodType: newBloodType,
            },
          },
        },
        undefined,
      );
      const data = response.data.updateSheet;
      const error = response.errors[0];
      expect(data).toBeNull();
      expect(error.message).toEqual(message.auth.unauthorized);
    });
    test('unsuccessfull with an unassigned ID or an ID referencing a sheet that does not belong to the current user', async () => {
      const response = await graphqlTestCall(
        UPDATE_SHEET,
        {
          updateSheetInput: {
            id: `UNKNOWN-${customId}`,
            changes: {
              bloodType: newBloodType,
            },
          },
        },
        accessToken,
      );
      const data = response.data.updateSheet.response;
      const error = response.data.updateSheet.errors[0];
      expect(data).toBeNull();
      expect(error.message).toEqual('Medical sheet not found.');
    });
    test('successfull with a user logged in, and a valid medical sheet id that belongs to this user', async () => {
      const response = await graphqlTestCall(
        UPDATE_SHEET,
        {
          updateSheetInput: {
            id: customId,
            changes: {
              bloodType: newBloodType,
            },
          },
        },
        accessToken,
      );
      const data = response.data.updateSheet.response;
      const errors = response.data.updateSheet.errors;
      expect(errors).toBeNull();
      expect(data.bloodType).toEqual(newBloodType);
    });
  });
});
