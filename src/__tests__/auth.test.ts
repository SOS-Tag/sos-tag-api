import { createConnection } from '@utils/mongoose';
import { CONFIRMATION, LOGIN, REGISTER } from './utils/graphql/auth.graphql';
import { alreadyUsedEmail, initialUserData, newUserData, password, unknownEmail } from './utils/mock-data';
import { createTestUser, graphqlTestCall, teardown } from './utils/setup';

beforeAll(async () => {
  await createConnection();
  await createTestUser(initialUserData, password);
});

afterAll(async () => {
  await teardown();
});

describe('Authentication service', () => {
  describe('User registration', () => {
    test('unsuccessful with already existing email', async () => {
      const newUser = {
        ...newUserData,
        email: alreadyUsedEmail,
      };
      const response = await graphqlTestCall(REGISTER, { registerInput: newUser });
      const data = response.data.register.response;
      const error = response.data.register.errors[0];
      expect(data).toBeNull();
      expect(error.message).toEqual(`An account associated to ${alreadyUsedEmail} already exists`);
    });

    test('unsuccessful with invalid or weak password', async () => {
      const newUser = {
        ...newUserData,
        password: '1234',
      };
      const response = await graphqlTestCall(REGISTER, { registerInput: newUser });
      const data = response.data.register.response;
      const error = response.data.register.errors[0];
      expect(data).toBeNull();
      expect(error.field).toEqual('password');
      expect(error.message).toEqual(
        'Password must contain a minimum of eight characters, and at least one uppercase letter, one lowercase letter, one number and one special character',
      );
    });

    test('unsuccessful with invalid phone number', async () => {
      const newUser = {
        ...newUserData,
        phone: '1234567890',
      };
      const response = await graphqlTestCall(REGISTER, { registerInput: newUser });
      const data = response.data.register.response;
      const error = response.data.register.errors[0];
      expect(data).toBeNull();
      expect(error.field).toEqual('phone');
      expect(error.message).toEqual('Phone must be a valid french phone number');
    });

    test('unsuccessful with at least one empty field', async () => {
      const newUser = {};
      const response = await graphqlTestCall(REGISTER, { registerInput: newUser });
      const data = response.data.register.response;
      const errors = response.data.register.errors;
      expect(data).toBeNull();
      expect(errors.length).toEqual(5);
      for (const error of errors) {
        expect(error.field).toBeDefined();
        expect(error.message).toBeDefined();
      }
    });

    test('successful with new user data returned', async () => {
      const newUser = newUserData;
      const response = await graphqlTestCall(REGISTER, { registerInput: newUser });
      const data = response.data.register.response;
      const errors = response.data.register.errors;
      expect(errors).toBeNull();
      expect(data).toEqual({
        fname: newUserData.fname,
        lname: newUserData.lname,
        email: newUserData.email.toLowerCase(),
      });
    });
  });

  describe('User confirmation', () => {
    test('unsuccessful with unknown or expired token', async () => {
      const response = await graphqlTestCall(CONFIRMATION, { token: 'abcdefghijkl.mnopqrst.uvwxyz' });
      const data = response.data.confirmUser.response;
      const error = response.data.confirmUser.errors[0];
      expect(data).toBeNull();
      expect(error.field).toBeNull();
      expect(error.message).toEqual('Account confirmation link has expired. A new email needs to be sent to confirm this account.');
    });
  });

  describe('User login', () => {
    test('unsuccessful with unknown user email', async () => {
      const loginInput = {
        email: unknownEmail,
        password,
      };
      const response = await graphqlTestCall(LOGIN, { loginInput });
      const data = response.data.login.response;
      const error = response.data.login.errors[0];
      expect(data).toBeNull();
      expect(error.field).toBeNull();
      expect(error.message).toEqual('This account does not exist');
    });
    test('unsuccessful with wrong password', async () => {
      const loginInput = {
        email: initialUserData.email,
        password: 'wrong' + password,
      };
      const response = await graphqlTestCall(LOGIN, { loginInput });
      const data = response.data.login.response;
      const error = response.data.login.errors[0];
      expect(data).toBeNull();
      expect(error.field).toBeNull();
      expect(error.message).toEqual('Password is incorrect');
    });
    test('successful with accesstoken and logged in user information returned', async () => {
      const loginInput = {
        email: initialUserData.email,
        password,
      };
      const response = await graphqlTestCall(LOGIN, { loginInput });
      const data = response.data.login.response;
      const errors = response.data.login.errors;
      expect(errors).toBeNull();
      expect(data.accessToken).toBeDefined();
      expect(data.user.email).toEqual(initialUserData.email.toLowerCase());
    });
  });
});
