import { faker } from '@faker-js/faker';
import { IUser } from '@models/user.model';
import { ErrorTypes } from '@utils/error';
import { createConnection } from '@utils/mongoose';
import { setConfirmationToken } from '@utils/token';
import { CONFIRMATION, LOGIN, REGISTER } from '@__tests__/utils/graphql/auth.graphql';
import { ASSIGN_SHEET_TO_USER, CREATE_SHEET, SHEETS_CURRENT_USER, SHEET_BY_SCANNING, UPDATE_SHEET } from '@__tests__/utils/graphql/sheet.graphql';
import { UPDATE_CURRENT_USER } from '@__tests__/utils/graphql/user.graphql';
import { graphqlTestCall, logTestUserIn, registerTestUser, teardown } from '@__tests__/utils/set-up';
import { nanoid } from 'nanoid';

let registeredAdmin: (IUser & { _id: string }) | null = null;
let adminAccessToken: string | undefined = undefined;

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
});

afterAll(async () => {
  await teardown();
});

let accessToken;
const sheetIds = [];
const user = {
  fname: faker.name.firstName(),
  lname: faker.name.lastName(),
  email: faker.internet.email().toLowerCase(),
  phone: faker.phone.phoneNumber('07########'),
};
const password = 'etVH$tzo4';
const confirmationToken = nanoid();
const sheetData = {
  enabled: true,
  fname: 'Louise',
  lname: 'Robert',
  sex: 'F',
  dateOfBirth: '1980-11-20T00:00:00.000Z',
  nationality: 'FR',
  bloodType: 'A-',
  smoker: false,
  organDonor: false,
  advanceDirectives: false,
  allergies: 'Pollen',
  medicalHistory: 'Anomalie cardiaque repérée',
  currentTreatment: 'Radiothérapie',
  treatingDoctor: {
    fname: 'Antonio',
    lname: 'Sanchez',
    phone: '',
  },
  emergencyContacts: [
    {
      fname: 'Clément',
      lname: 'Robert',
      role: 'Compagnon',
      phone: '0309792080',
    },
    {
      fname: 'Thomas',
      lname: 'Robert',
      role: 'Frère',
      phone: '0354215688',
    },
  ],
};

describe('Scenario 1', () => {
  describe('Creating two sheets', () => {
    test('successful', async () => {
      const response = await graphqlTestCall(
        CREATE_SHEET,
        {
          count: 2,
        },
        adminAccessToken,
      );

      const data = response.data.createSheet.response;
      const error = response.data.createSheet.error;

      expect(error).toBeNull();
      expect(typeof data[0]._id).toBe('string');
      expect(typeof data[1]._id).toBe('string');
      sheetIds[0] = data[0]._id;
      sheetIds[1] = data[1]._id;
    });
  });

  describe('Sign up', () => {
    describe('Registration', () => {
      test('successful with new user data returned', async () => {
        const response = await graphqlTestCall(REGISTER, { registerInput: { ...user, password } });
        const { _id: registeredUserId, ...registeredUserData } = response.data.register.response;

        const error = response.data.register.error;

        expect(error).toBeNull();
        expect(registeredUserData).toEqual({
          fname: user.fname,
          lname: user.lname,
          email: user.email,
        });
        setConfirmationToken(registeredUserId, confirmationToken);
      });
    });

    describe('Confirmation', () => {
      test('successful with a valid token (containing a registered but unconfirmed user)', async () => {
        const response = await graphqlTestCall(CONFIRMATION, { token: confirmationToken });
        const success = response.data.confirmUser.response;

        const error = response.data.confirmUser.error;

        expect(error).toBeNull();
        expect(success).toBeTruthy();
      });
    });
  });

  describe('Sign in', () => {
    test('successful with accesstoken and logged in user information returned', async () => {
      const response = await graphqlTestCall(LOGIN, { loginInput: { email: user.email, password } });

      const data = response.data.login.response;
      const error = response.data.login.error;

      expect(error).toBeNull();
      expect(data.accessToken).toBeDefined();
      expect(data.accessToken.length).toBeGreaterThan(0);
      expect(data.user.email).toEqual(user.email);
      accessToken = data.accessToken;
    });
  });

  describe('Update current user account data', () => {
    test('successful', async () => {
      const changes = {
        address: '43 rue Léon Cladel',
        zipCode: '07000',
        city: 'Privas',
        phone: '0125463002',
      };
      const response = await graphqlTestCall(
        UPDATE_CURRENT_USER,
        {
          updateInput: {
            changes,
          },
        },
        accessToken,
      );

      const data = response.data.updateCurrentUser.response;
      const error = response.data.updateCurrentUser.error;

      expect(error).toBeNull();
      expect(data).toEqual({
        activated: true,
        confirmed: true,
        nationality: null,
        ...user,
        ...changes,
        password: null,
      });
    });
  });

  describe("Retrieve current user's sheets #1", () => {
    test('successful', async () => {
      const response = await graphqlTestCall(SHEETS_CURRENT_USER, {}, accessToken);

      const data = response.data.sheetsCurrentUser.response;
      const error = response.data.sheetsCurrentUser.error;

      expect(error).toBeNull();
      expect(data.length).toEqual(0);
    });
  });

  describe('Assign 1st sheet', () => {
    test('successful', async () => {
      const response = await graphqlTestCall(
        ASSIGN_SHEET_TO_USER,
        {
          assignSheetToUserInput: {
            id: sheetIds[0],
          },
        },
        accessToken,
      );

      const data = response.data.assignSheetToUser.response;
      const error = response.data.assignSheetToUser.error;

      expect(error).toBeNull();
      expect(data._id).toEqual(sheetIds[0]);
      expect(data.enabled).toEqual(true);
    });
  });

  describe('Update 1st sheet data #1', () => {
    test('successful', async () => {
      const response = await graphqlTestCall(
        UPDATE_SHEET,
        {
          updateInput: {
            id: sheetIds[0],
            changes: {
              ...sheetData,
            },
          },
        },
        accessToken,
      );

      const data = response.data.updateCurrentUserSheet.response;
      const error = response.data.updateCurrentUserSheet.error;

      expect(error).toBeNull();
      expect(data).toEqual({
        ...sheetData,
      });
    });
  });

  describe('Update 1st sheet data #2', () => {
    test('successful with nested data', async () => {
      const changes = {
        organDonor: true,
        treatingDoctor: {
          phone: '0621548962',
        },
        emergencyContacts: [
          {
            fname: 'Clément',
            lname: 'Robert',
            role: 'Compagnon',
            phone: '0621458874',
          },
          {
            fname: 'Thomas',
            lname: 'Robert',
            role: 'Beau Frère',
            phone: '0354215688',
          },
        ],
      };
      const response = await graphqlTestCall(
        UPDATE_SHEET,
        {
          updateInput: {
            id: sheetIds[0],
            changes,
          },
        },
        accessToken,
      );

      const data = response.data.updateCurrentUserSheet.response;
      const error = response.data.updateCurrentUserSheet.error;

      expect(error).toBeNull();
      expect(data).toEqual({
        ...sheetData,
        ...changes,
        treatingDoctor: {
          ...sheetData.treatingDoctor,
          ...changes.treatingDoctor,
        },
      });
    });
  });

  describe("Retrieve current user's sheets #2", () => {
    test('successful', async () => {
      const response = await graphqlTestCall(SHEETS_CURRENT_USER, {}, accessToken);

      const data = response.data.sheetsCurrentUser.response;
      const error = response.data.sheetsCurrentUser.error;

      expect(error).toBeNull();
      expect(data.length).toEqual(1);
      expect(data[0]._id).toEqual(sheetIds[0]);
    });
  });

  describe('Retrieve 1st sheet by scanning #1', () => {
    test('successful', async () => {
      const response = await graphqlTestCall(SHEET_BY_SCANNING, {
        sheetId: sheetIds[0],
      });

      const data = response.data.sheetByScanning.response;
      const error = response.data.sheetByScanning.error;

      expect(error).toBeNull();
      expect(data._id).toEqual(sheetIds[0]);
    });
  });

  describe('Retrieve 2nd sheet by scanning #1', () => {
    test('unsuccessful because it is not assigned to a user', async () => {
      const response = await graphqlTestCall(SHEET_BY_SCANNING, {
        sheetId: sheetIds[1],
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
  });

  describe('Assign 2nd sheet', () => {
    test('successful', async () => {
      const response = await graphqlTestCall(
        ASSIGN_SHEET_TO_USER,
        {
          assignSheetToUserInput: {
            id: sheetIds[1],
          },
        },
        accessToken,
      );

      const data = response.data.assignSheetToUser.response;
      const error = response.data.assignSheetToUser.error;

      expect(error).toBeNull();
      expect(data._id).toEqual(sheetIds[1]);
      expect(data.enabled).toEqual(true);
    });
  });

  describe("Retrieve current user's sheets #3", () => {
    test('successful', async () => {
      const response = await graphqlTestCall(SHEETS_CURRENT_USER, {}, accessToken);

      const data = response.data.sheetsCurrentUser.response;
      const error = response.data.sheetsCurrentUser.error;

      expect(error).toBeNull();
      expect(data.length).toEqual(2);
      expect(data[0]._id).toEqual(sheetIds[0]);
      expect(data[1]._id).toEqual(sheetIds[1]);
    });
  });

  describe('Retrieve 2nd sheet by scanning #2', () => {
    test('successful', async () => {
      const response = await graphqlTestCall(SHEET_BY_SCANNING, {
        sheetId: sheetIds[1],
      });

      const data = response.data.sheetByScanning.response;
      const error = response.data.sheetByScanning.error;

      expect(error).toBeNull();
      expect(data._id).toEqual(sheetIds[1]);
    });
  });

  describe('Update 1st sheet data #3: disabling the sheet', () => {
    test('successful', async () => {
      const changes = { enabled: false };
      const response = await graphqlTestCall(
        UPDATE_SHEET,
        {
          updateInput: {
            id: sheetIds[0],
            changes,
          },
        },
        accessToken,
      );

      const data = response.data.updateCurrentUserSheet.response;
      const error = response.data.updateCurrentUserSheet.error;

      expect(error).toBeNull();
      expect(data.enabled).toEqual(false);
    });
  });

  describe('Retrieve 1st sheet by scanning #2', () => {
    test('unsuccessful because sheet is disabled', async () => {
      const response = await graphqlTestCall(SHEET_BY_SCANNING, {
        sheetId: sheetIds[0],
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
  });

  describe('Update current user: deactivating account', () => {
    test('successful', async () => {
      const response = await graphqlTestCall(
        UPDATE_CURRENT_USER,
        {
          updateInput: {
            changes: {
              activated: false,
            },
          },
        },
        accessToken,
      );

      const data = response.data.updateCurrentUser.response;
      const error = response.data.updateCurrentUser.error;

      expect(error).toBeNull();
      expect(data.activated).toEqual(false);
    });
  });

  describe('Retrieve 2nd sheet by scanning #3', () => {
    test('unsuccessful because user account is deactivated', async () => {
      const response = await graphqlTestCall(SHEET_BY_SCANNING, {
        sheetId: sheetIds[1],
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
  });
});
