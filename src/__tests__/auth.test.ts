import message from '@locales/en/translation.json';
import { createConnection } from '@utils/mongoose';
import { applyVariable } from '@utils/object';
import { CONFIRMATION, LOGIN, REGISTER } from './utils/graphql/auth.graphql';
import { alreadyUsedEmail, initialUserData, invalidPhoneNumber, newUserData, password, unknownEmail } from './utils/mock-data';
import { graphqlTestCall, registerTestUser, teardown } from './utils/set-up';

beforeAll(async () => {
  await createConnection();
  await registerTestUser(initialUserData, password);
});

afterAll(async () => {
  await teardown();
});

describe('Authentication service', () => {
  describe('Registration', () => {
    test('unsuccessful with already existing email', async () => {
      const newUser = {
        ...newUserData,
        email: alreadyUsedEmail,
      };
      const response = await graphqlTestCall(REGISTER, { registerInput: newUser });
      const data = response.data.register.response;
      const error = response.data.register.errors[0];
      expect(data).toBeNull();
      expect(error.message).toEqual(applyVariable(message.auth.account_already_exist, alreadyUsedEmail));
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
      expect(error.message).toEqual(message.error.invalid_password);
    });

    test('unsuccessful with invalid phone number', async () => {
      const newUser = {
        ...newUserData,
        phone: invalidPhoneNumber,
      };
      const response = await graphqlTestCall(REGISTER, { registerInput: newUser });
      const data = response.data.register.response;
      const error = response.data.register.errors[0];
      expect(data).toBeNull();
      expect(error.field).toEqual('phone');
      expect(error.message).toEqual(message.error.invalid_phone);
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
        expect(error.message).toContain('is required');
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

  describe('Confirmation', () => {
    test('unsuccessful with unknown or expired token', async () => {
      const response = await graphqlTestCall(CONFIRMATION, { token: 'abcdefghijkl.mnopqrst.uvwxyz' });
      const data = response.data.confirmUser.response;
      const error = response.data.confirmUser.errors[0];
      expect(data).toBeNull();
      expect(error.field).toBeNull();
      expect(error.message).toEqual(message.auth.account_confirmation_expired);
    });
  });

  describe('Login', () => {
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
      expect(error.message).toEqual(message.auth.account_does_not_exist);
    });
    test('unsuccessful with wrong password', async () => {
      const loginInput = {
        email: initialUserData.email,
        password: password + 'isWrong',
      };
      const response = await graphqlTestCall(LOGIN, { loginInput });
      const data = response.data.login.response;
      const error = response.data.login.errors[0];
      expect(data).toBeNull();
      expect(error.field).toBeNull();
      expect(error.message).toEqual(message.auth.incorrect_password);
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
