import { IUser } from '@models/user.model';
import { ErrorTypes, FieldErrorTypes } from '@utils/error';
import { createConnection } from '@utils/mongoose';
import { setConfirmationToken, setForgotPasswordToken } from '@utils/token';
import { CHANGE_PASSWORD, CONFIRMATION, FORGOT_PASSWORD, LOGIN, REGISTER, RESEND_CONFIRMATION } from '@__tests__/utils/graphql/auth.graphql';
import {
  alreadyUsedEmail,
  confirmationToken,
  forgotPasswordToken,
  initialUserData,
  invalidPhoneNumber,
  newPassword,
  newUserData,
  password,
  unknownEmail,
  weakPassword,
} from '@__tests__/utils/mock-data';
import { graphqlTestCall, registerTestUser, teardown } from '@__tests__/utils/set-up';
import { nanoid } from 'nanoid';

let confirmedUser: (IUser & { _id: string }) | null = null;
let unconfirmedUser: (IUser & { _id: string }) | null = null;

beforeAll(async () => {
  await createConnection();
  unconfirmedUser = await registerTestUser(initialUserData, password, ['client'], false);
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
      const error = response.data.register.error;

      expect(data).toBeNull();
      expect(error.type).toEqual(ErrorTypes.emailAlreadyExists);
      expect(error.code).toEqual(409);
      expect(error.title).toEqual('Conflict');
      expect(error.message).toEqual(`An account associated to ${alreadyUsedEmail} already exists.`);
      expect(error.fields).toBeNull();
    });

    test('unsuccessful with invalid/weak password', async () => {
      const newUser = {
        ...newUserData,
        password: weakPassword,
      };

      const response = await graphqlTestCall(REGISTER, { registerInput: newUser });

      const data = response.data.register.response;
      const error = response.data.register.error;

      expect(data).toBeNull();
      expect(error.type).toEqual(ErrorTypes.registrationValidation);
      expect(error.code).toEqual(400);
      expect(error.title).toEqual('Bad request');
      expect(error.message).toEqual('Some of the inputs provided for registration are missing or malformed.');
      expect(error.timestamp).toBeDefined();

      expect(error.fields).toBeDefined();
      const [field] = error.fields;
      expect(field).toEqual({
        type: FieldErrorTypes.invalid,
        name: 'password',
        detail:
          'Password must contain a minimum of eight characters, and at least one uppercase letter, one lowercase letter, one number and one special character.',
      });
    });

    test('unsuccessful with at least one invalid input', async () => {
      const newUser = {
        ...newUserData,
        phone: invalidPhoneNumber,
      };

      const response = await graphqlTestCall(REGISTER, { registerInput: newUser });

      const data = response.data.register.response;
      const error = response.data.register.error;

      expect(data).toBeNull();
      expect(error.type).toEqual(ErrorTypes.registrationValidation);
      expect(error.code).toEqual(400);
      expect(error.title).toEqual('Bad request');
      expect(error.message).toEqual('Some of the inputs provided for registration are missing or malformed.');
      expect(error.timestamp).toBeDefined();

      const [field] = error.fields;
      expect(field).toEqual({
        type: FieldErrorTypes.invalid,
        name: 'phone',
        detail: 'Phone must be a valid french phone number.',
      });
    });

    test('unsuccessful with at least one empty field', async () => {
      const newUser = {};

      const response = await graphqlTestCall(REGISTER, { registerInput: newUser });

      const data = response.data.register.response;
      const error = response.data.register.error;

      expect(data).toBeNull();
      expect(error.type).toEqual(ErrorTypes.registrationValidation);
      expect(error.code).toEqual(400);
      expect(error.title).toEqual('Bad request');
      expect(error.message).toEqual('Some of the inputs provided for registration are missing or malformed.');
      expect(error.timestamp).toBeDefined();

      const expectedMissingFields = Object.keys(newUserData);

      expect(error.fields).toBeDefined();
      for (const fieldError of error.fields) {
        expect(fieldError.type).toEqual(FieldErrorTypes.empty);
        expect(expectedMissingFields.includes(fieldError.name));
        expect(fieldError.detail).toEqual(`The ${fieldError.name} is required.`);
      }
    });

    test('successful with new user data returned', async () => {
      const response = await graphqlTestCall(REGISTER, { registerInput: newUserData });

      const { _id: registeredUserId, ...registeredUserData } = response.data.register.response;
      const error = response.data.register.error;

      expect(error).toBeNull();
      expect(registeredUserData).toEqual({
        fname: newUserData.fname,
        lname: newUserData.lname,
        email: newUserData.email.toLowerCase(),
      });

      setConfirmationToken(registeredUserId, confirmationToken);
    });
  });

  describe('Account confirmation', () => {
    test('unsuccessful with an empty token as parameter', async () => {
      const response = await graphqlTestCall(CONFIRMATION, { token: '' });

      const success = response.data.confirmUser.response;
      const error = response.data.confirmUser.error;

      expect(success).toBeNull();
      expect(error.type).toEqual(ErrorTypes.confirmationValidation);
      expect(error.code).toEqual(400);
      expect(error.title).toEqual('Bad request');
      expect(error.message).toEqual('The token provided to confirm the user account is missing.');
      expect(error.timestamp).toBeDefined();

      const [field] = error.fields;
      expect(field).toEqual({
        type: FieldErrorTypes.empty,
        name: 'token',
        detail: 'The token is required.',
      });
    });

    test('unsuccessful with unknown or expired token', async () => {
      const response = await graphqlTestCall(CONFIRMATION, { token: nanoid() });

      const success = response.data.confirmUser.response;
      const error = response.data.confirmUser.error;

      expect(success).toBeNull();
      expect(error.type).toEqual(ErrorTypes.accountLinkExpired);
      expect(error.code).toEqual(410);
      expect(error.title).toEqual('Gone');
      expect(error.message).toEqual('Account confirmation link has expired. A new email needs to be sent to confirm this account.');
      expect(error.timestamp).toBeDefined();
      expect(error.fields).toBeNull();
    });

    test('successful with a valid token (containing a registered but unconfirmed user)', async () => {
      const response = await graphqlTestCall(CONFIRMATION, { token: confirmationToken });

      const success = response.data.confirmUser.response;
      const error = response.data.confirmUser.error;

      expect(error).toBeNull();
      expect(success).toBeTruthy();
    });
  });

  describe('Login', () => {
    test('unsuccessful with empty parameters', async () => {
      const response = await graphqlTestCall(LOGIN, { loginInput: {} });

      const data = response.data.login.response;
      const error = response.data.login.error;

      expect(data).toBeNull();
      expect(error.type).toEqual(ErrorTypes.loginValidation);
      expect(error.code).toEqual(400);
      expect(error.title).toEqual('Bad request');
      expect(error.message).toEqual('Some of the inputs provided for log in are missing.');
      expect(error.timestamp).toBeDefined();

      const expectedMissingFields = ['email', 'password'];

      expect(error.fields).toBeDefined();
      for (const fieldError of error.fields) {
        expect(fieldError.type).toEqual(FieldErrorTypes.empty);
        expect(expectedMissingFields.includes(fieldError.name));
        expect(fieldError.detail).toEqual(`The ${fieldError.name} is required.`);
      }
    });

    test('unsuccessful with unconfirmed user account', async () => {
      const loginInput = {
        email: unconfirmedUser.email,
        password,
      };

      const response = await graphqlTestCall(LOGIN, { loginInput });

      const data = response.data.login.response;
      const error = response.data.login.error;

      expect(data).toBeNull();
      expect(error.type).toEqual(ErrorTypes.unConfirmedAccount);
      expect(error.code).toEqual(403);
      expect(error.title).toEqual('Forbidden');
      expect(error.message).toEqual(`Account must be validated by clicking the link sent to ${unconfirmedUser.email}.`);
      expect(error.timestamp).toBeDefined();
      expect(error.fields).toBeNull();
    });

    test('unsuccessful with unknown user email', async () => {
      const loginInput = {
        email: unknownEmail,
        password,
      };
      const response = await graphqlTestCall(LOGIN, { loginInput });

      const data = response.data.login.response;
      const error = response.data.login.error;

      expect(data).toBeNull();
      expect(error.type).toEqual(ErrorTypes.accountNotFound);
      expect(error.code).toEqual(404);
      expect(error.title).toEqual('Not found');
      expect(error.message).toEqual('This account does not exist.');
      expect(error.timestamp).toBeDefined();
      expect(error.fields).toBeNull();
    });

    test('unsuccessful with wrong password', async () => {
      const loginInput = {
        email: newUserData.email,
        password: `WRONG:${password}`,
      };
      const response = await graphqlTestCall(LOGIN, { loginInput });

      const data = response.data.login.response;
      const error = response.data.login.error;

      expect(data).toBeNull();
      expect(error.type).toEqual(ErrorTypes.incorrectPasword);
      expect(error.code).toEqual(403);
      expect(error.title).toEqual('Forbidden');
      expect(error.message).toEqual('Password is incorrect.');
      expect(error.timestamp).toBeDefined();
      expect(error.fields).toBeNull();
    });

    test('successful with accesstoken and logged in user information returned', async () => {
      const loginInput = {
        email: newUserData.email,
        password,
      };
      const response = await graphqlTestCall(LOGIN, { loginInput });

      const data = response.data.login.response;
      const error = response.data.login.error;

      expect(error).toBeNull();
      expect(data.accessToken).toBeDefined();
      expect(data.accessToken.length).toBeGreaterThan(0);
      expect(data.user.email).toEqual(newUserData.email.toLowerCase());
    });
  });

  describe('Resend confirmation link', () => {
    test('unsuccessful with an empty email as parameter', async () => {
      const response = await graphqlTestCall(RESEND_CONFIRMATION, { userEmail: '' });

      const success = response.data.resendConfirmationLink.response;
      const error = response.data.resendConfirmationLink.error;

      expect(success).toBeNull();
      expect(error.type).toEqual(ErrorTypes.resendConfirmationValidation);
      expect(error.code).toEqual(400);
      expect(error.title).toEqual('Bad request');
      expect(error.message).toEqual('The email provided to resend a confirmation link is missing.');
      expect(error.timestamp).toBeDefined();

      const [field] = error.fields;
      expect(field).toEqual({
        type: FieldErrorTypes.empty,
        name: 'email',
        detail: 'The email is required.',
      });
    });

    test('unsuccessful with an unexisting email', async () => {
      const response = await graphqlTestCall(RESEND_CONFIRMATION, { userEmail: unknownEmail });

      const success = response.data.resendConfirmationLink.response;
      const error = response.data.resendConfirmationLink.error;

      expect(success).toBeNull();
      expect(error.type).toEqual(ErrorTypes.accountNotFound);
      expect(error.code).toEqual(404);
      expect(error.title).toEqual('Not found');
      expect(error.message).toEqual('This account does not exist.');
      expect(error.timestamp).toBeDefined();
    });

    test('successful with a user who can then confirm his account and log in', async () => {
      const resendConfirmationResponse = await graphqlTestCall(RESEND_CONFIRMATION, { userEmail: unconfirmedUser.email });

      const resendConfirmationSuccess = resendConfirmationResponse.data.resendConfirmationLink.response;
      const resendConfirmationError = resendConfirmationResponse.data.resendConfirmationLink.error;

      expect(resendConfirmationError).toBeNull();
      expect(resendConfirmationSuccess).toBeTruthy();

      setConfirmationToken(unconfirmedUser.id, confirmationToken);

      const confirmationResponse = await graphqlTestCall(CONFIRMATION, { token: confirmationToken });

      const confirmationSuccess = confirmationResponse.data.confirmUser.response;
      const confirmationError = confirmationResponse.data.confirmUser.error;

      expect(confirmationError).toBeNull();
      expect(confirmationSuccess).toBeTruthy();

      confirmedUser = unconfirmedUser;

      const loginInput = {
        email: confirmedUser.email,
        password,
      };
      const loginResponse = await graphqlTestCall(LOGIN, { loginInput });

      const loginData = loginResponse.data.login.response;
      const loginError = loginResponse.data.login.error;

      expect(loginError).toBeNull();
      expect(loginData.accessToken).toBeDefined();
      expect(loginData.accessToken.length).toBeGreaterThan(0);
      expect(loginData.user.email).toEqual(confirmedUser.email.toLowerCase());
    });
  });

  describe('Forgot Password', () => {
    test('unsuccessful with an empty email as parameter', async () => {
      const response = await graphqlTestCall(FORGOT_PASSWORD, { userEmail: '' });

      const success = response.data.forgotPassword.response;
      const error = response.data.forgotPassword.error;

      expect(success).toBeNull();
      expect(error.type).toEqual(ErrorTypes.forgotPasswordValidation);
      expect(error.code).toEqual(400);
      expect(error.title).toEqual('Bad request');
      expect(error.message).toEqual("The email provided to generate the 'Forgot password' link is missing.");
      expect(error.timestamp).toBeDefined();

      const [field] = error.fields;
      expect(field).toEqual({
        type: FieldErrorTypes.empty,
        name: 'email',
        detail: 'The email is required.',
      });
    });

    test('unsuccessful with an unexisting email', async () => {
      const response = await graphqlTestCall(FORGOT_PASSWORD, { userEmail: unknownEmail });

      const success = response.data.forgotPassword.response;
      const error = response.data.forgotPassword.error;

      expect(success).toBeNull();
      expect(error.type).toEqual(ErrorTypes.accountNotFound);
      expect(error.code).toEqual(404);
      expect(error.title).toEqual('Not found');
      expect(error.message).toEqual('This account does not exist.');
      expect(error.timestamp).toBeDefined();
      expect(error.fields).toBeNull();
    });

    test('successful with a token that has been set which will allow to identify the user when he will try to update his password', async () => {
      const response = await graphqlTestCall(FORGOT_PASSWORD, { userEmail: initialUserData.email });

      const success = response.data.forgotPassword.response;
      const error = response.data.forgotPassword.error;

      expect(error).toBeNull();
      expect(success).toBeTruthy();

      setForgotPasswordToken(confirmedUser.id, forgotPasswordToken);
    });
  });

  describe('Change Password', () => {
    test('unsuccessful with an empty token and/or an empty password', async () => {
      const response = await graphqlTestCall(CHANGE_PASSWORD, { changePasswordInput: {} });

      const success = response.data.changePassword.response;
      const error = response.data.changePassword.error;

      expect(success).toBeNull();
      expect(error.type).toEqual(ErrorTypes.changePasswordValidation);
      expect(error.code).toEqual(400);
      expect(error.title).toEqual('Bad request');
      expect(error.message).toEqual('Some of the inputs provided for changing the password are malformed.');
      expect(error.timestamp).toBeDefined();

      expect(error.fields).toBeDefined();
      for (const fieldError of error.fields) {
        expect(fieldError.type).toEqual(FieldErrorTypes.empty);
        expect(fieldError.name).toBeDefined();
        expect(fieldError.detail).toEqual(`The ${fieldError.name} is required.`);
      }
    });

    test('unsuccessful with invalid/weak password', async () => {
      const response = await graphqlTestCall(CHANGE_PASSWORD, {
        changePasswordInput: {
          token: forgotPasswordToken,
          password: weakPassword,
        },
      });

      const success = response.data.changePassword.response;
      const error = response.data.changePassword.error;

      expect(success).toBeNull();
      expect(error.type).toEqual(ErrorTypes.changePasswordValidation);
      expect(error.code).toEqual(400);
      expect(error.title).toEqual('Bad request');
      expect(error.message).toEqual('Some of the inputs provided for changing the password are malformed.');
      expect(error.timestamp).toBeDefined();

      const [field] = error.fields;
      expect(field).toEqual({
        type: FieldErrorTypes.invalid,
        name: 'password',
        detail:
          'Password must contain a minimum of eight characters, and at least one uppercase letter, one lowercase letter, one number and one special character.',
      });
    });

    test('unsuccessful with unknown or expired token', async () => {
      const response = await graphqlTestCall(CHANGE_PASSWORD, {
        changePasswordInput: {
          token: nanoid(),
          password: newPassword,
        },
      });

      const success = response.data.changePassword.response;
      const error = response.data.changePassword.error;

      expect(success).toBeNull();
      expect(error.type).toEqual(ErrorTypes.passwordLinkExpired);
      expect(error.code).toEqual(410);
      expect(error.title).toEqual('Gone');
      expect(error.message).toEqual('Password modification link has expired. A new email needs to be sent to change this account password.');
      expect(error.timestamp).toBeDefined();
      expect(error.fields).toBeNull();
    });

    test('successful with a user who cannot log in using his old password but who can log in using his new one', async () => {
      const changePasswordResponse = await graphqlTestCall(CHANGE_PASSWORD, {
        changePasswordInput: {
          token: forgotPasswordToken,
          password: newPassword,
        },
      });

      const changePasswordSuccess = changePasswordResponse.data.changePassword.response;
      const changePasswordError = changePasswordResponse.data.changePassword.error;

      expect(changePasswordError).toBeNull();
      expect(changePasswordSuccess).toBeTruthy();

      const oldPassword = password;
      const failedLoginResponse = await graphqlTestCall(LOGIN, {
        loginInput: {
          email: confirmedUser.email,
          password: oldPassword,
        },
      });

      const failedLoginData = failedLoginResponse.data.login.response;
      const failedLoginError = failedLoginResponse.data.login.error;

      expect(failedLoginData).toBeNull();
      expect(failedLoginError.type).toEqual(ErrorTypes.incorrectPasword);
      expect(failedLoginError.code).toEqual(403);
      expect(failedLoginError.title).toEqual('Forbidden');
      expect(failedLoginError.message).toEqual('Password is incorrect.');
      expect(failedLoginError.timestamp).toBeDefined();
      expect(failedLoginError.fields).toBeNull();

      const successLoginResponse = await graphqlTestCall(LOGIN, {
        loginInput: {
          email: confirmedUser.email,
          password: newPassword,
        },
      });

      const successLoginData = successLoginResponse.data.login.response;
      const successLoginError = successLoginResponse.data.login.error;

      expect(successLoginError).toBeNull();
      expect(successLoginData.accessToken).toBeDefined();
      expect(successLoginData.accessToken.length).toBeGreaterThan(0);
      expect(successLoginData.user.email).toEqual(confirmedUser.email.toLowerCase());
    });
  });
});
