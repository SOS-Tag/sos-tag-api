import message from '@locales/en/translation.json';
import { IUser } from '@models/user.model';
import { createConnection } from '@utils/mongoose';
import { applyVariable } from '@utils/object';
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

let confirmedUserData: (IUser & { _id: string }) | null = null;
let unconfirmedUserData: (IUser & { _id: string }) | null = null;

beforeAll(async () => {
  await createConnection();
  unconfirmedUserData = await registerTestUser(initialUserData, password, false);
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

    test('unsuccessful with invalid/weak password', async () => {
      const newUser = {
        ...newUserData,
        password: weakPassword,
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
      const response = await graphqlTestCall(REGISTER, { registerInput: newUserData });
      const { _id: registeredUserId, ...registeredUserData } = response.data.register.response;
      const errors = response.data.register.errors;
      expect(errors).toBeNull();
      expect(registeredUserData).toEqual({
        fname: newUserData.fname,
        lname: newUserData.lname,
        email: newUserData.email.toLowerCase(),
      });
      setConfirmationToken(registeredUserId, confirmationToken);
    });
  });

  describe('Confirmation', () => {
    test('unsuccessful with an empty token as parameter', async () => {
      const response = await graphqlTestCall(CONFIRMATION, { token: '' });
      const success = response.data.confirmUser.response;
      const error = response.data.confirmUser.errors[0];
      expect(success).toBeNull();
      expect(error.field).toEqual('token');
      expect(error.message).toEqual('The token is required');
    });

    test('unsuccessful with unknown or expired token', async () => {
      const response = await graphqlTestCall(CONFIRMATION, { token: nanoid() });
      const success = response.data.confirmUser.response;
      const error = response.data.confirmUser.errors[0];
      expect(success).toBeNull();
      expect(error.field).toBeNull();
      expect(error.message).toEqual(message.auth.account_confirmation_expired);
    });

    test('successful with a valid token (containing a registered but unconfirmed user)', async () => {
      const response = await graphqlTestCall(CONFIRMATION, { token: confirmationToken });
      const success = response.data.confirmUser.response;
      const errors = response.data.confirmUser.errors;
      expect(errors).toBeNull();
      expect(success).toBeTruthy();
    });
  });

  describe('Login', () => {
    test('unsuccessful with unconfirmed user account', async () => {
      const loginInput = {
        email: unconfirmedUserData.email,
        password,
      };
      const response = await graphqlTestCall(LOGIN, { loginInput });
      const data = response.data.login.response;
      const error = response.data.login.errors[0];
      expect(data).toBeNull();
      expect(error.field).toBeNull();
      expect(error.message).toEqual(applyVariable(message.auth.unvalidated_account, unconfirmedUserData.email));
    });

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
        email: newUserData.email,
        password: `WRONG-${password}`,
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
        email: newUserData.email,
        password,
      };
      const response = await graphqlTestCall(LOGIN, { loginInput });
      const data = response.data.login.response;
      const errors = response.data.login.errors;
      expect(errors).toBeNull();
      expect(data.accessToken).toBeDefined();
      expect(data.accessToken.length).toBeGreaterThan(0);
      expect(data.user.email).toEqual(newUserData.email.toLowerCase());
    });
  });

  describe('Resend confirmation', () => {
    test('unsuccessful with an empty email as parameter', async () => {
      const response = await graphqlTestCall(RESEND_CONFIRMATION, { userEmail: '' });
      const success = response.data.resendConfirmationLink.response;
      const error = response.data.resendConfirmationLink.errors[0];
      expect(success).toBeNull();
      expect(error.field).toEqual('email');
      expect(error.message).toEqual('The email is required');
    });

    test('unsuccessful with an unexisting email', async () => {
      const response = await graphqlTestCall(RESEND_CONFIRMATION, { userEmail: unknownEmail });
      const success = response.data.resendConfirmationLink.response;
      const error = response.data.resendConfirmationLink.errors[0];
      expect(success).toBeNull();
      expect(error.field).toBeNull();
      expect(error.message).toEqual(message.auth.account_does_not_exist);
    });

    test('successful with a user who can then confirm his account and log in', async () => {
      const resendConfirmationResponse = await graphqlTestCall(RESEND_CONFIRMATION, { userEmail: unconfirmedUserData.email });
      const resendConfirmationSuccess = resendConfirmationResponse.data.resendConfirmationLink.response;
      const resendConfirmationErrors = resendConfirmationResponse.data.resendConfirmationLink.errors;
      expect(resendConfirmationErrors).toBeNull();
      expect(resendConfirmationSuccess).toBeTruthy();

      setConfirmationToken(unconfirmedUserData._id, confirmationToken);

      const confirmationResponse = await graphqlTestCall(CONFIRMATION, { token: confirmationToken });
      const confirmationSuccess = confirmationResponse.data.confirmUser.response;
      const confirmationErrors = confirmationResponse.data.confirmUser.errors;
      expect(confirmationErrors).toBeNull();
      expect(confirmationSuccess).toBeTruthy();

      confirmedUserData = unconfirmedUserData;

      const loginInput = {
        email: confirmedUserData.email,
        password,
      };
      const loginResponse = await graphqlTestCall(LOGIN, { loginInput });
      const loginData = loginResponse.data.login.response;
      const loginErrors = loginResponse.data.login.errors;
      expect(loginErrors).toBeNull();
      expect(loginData.accessToken).toBeDefined();
      expect(loginData.accessToken.length).toBeGreaterThan(0);
      expect(loginData.user.email).toEqual(confirmedUserData.email.toLowerCase());
    });
  });

  describe('Forgot Password', () => {
    test('unsuccessful with an empty email as parameter', async () => {
      const response = await graphqlTestCall(FORGOT_PASSWORD, { userEmail: '' });
      const success = response.data.forgotPassword.response;
      const error = response.data.forgotPassword.errors[0];
      expect(success).toBeNull();
      expect(error.field).toEqual('email');
      expect(error.message).toEqual('The email is required');
    });

    test('unsuccessful with an unexisting email', async () => {
      const response = await graphqlTestCall(FORGOT_PASSWORD, { userEmail: unknownEmail });
      const success = response.data.forgotPassword.response;
      const error = response.data.forgotPassword.errors[0];
      expect(success).toBeNull();
      expect(error.field).toBeNull();
      expect(error.message).toEqual(message.auth.account_does_not_exist);
    });

    test('successful with a token that has been set which will allow to identify the user when he will try to update his password', async () => {
      const response = await graphqlTestCall(FORGOT_PASSWORD, { userEmail: initialUserData.email });
      const success = response.data.forgotPassword.response;
      const errors = response.data.forgotPassword.errors;
      expect(errors).toBeNull();
      expect(success).toBeTruthy();
      setForgotPasswordToken(confirmedUserData.id, forgotPasswordToken);
    });
  });

  describe('Change Password', () => {
    test('unsuccessful with an empty token and/or an empty password', async () => {
      const response = await graphqlTestCall(CHANGE_PASSWORD, { changePasswordInput: {} });
      const success = response.data.changePassword.response;
      const errors = response.data.changePassword.errors;
      expect(success).toBeNull();
      expect(errors.length).toEqual(2);
      for (const error of errors) {
        expect(error.field).toBeDefined();
        expect(error.message).toContain('is required');
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
      const error = response.data.changePassword.errors[0];
      expect(success).toBeNull();
      expect(error.field).toEqual('password');
      expect(error.message).toEqual(message.error.invalid_password);
    });

    test('unsuccessful with unknown or expired token', async () => {
      const response = await graphqlTestCall(CHANGE_PASSWORD, {
        changePasswordInput: {
          token: nanoid(),
          password: newPassword,
        },
      });
      const success = response.data.changePassword.response;
      const error = response.data.changePassword.errors[0];
      expect(success).toBeNull();
      expect(error.field).toBeNull();
      expect(error.message).toEqual(message.auth.password_modification_expired);
    });

    test('successful with a user who cannot log in using his old password but who can log in using his new one', async () => {
      const changePasswordResponse = await graphqlTestCall(CHANGE_PASSWORD, {
        changePasswordInput: {
          token: forgotPasswordToken,
          password: newPassword,
        },
      });
      const changePasswordSuccess = changePasswordResponse.data.changePassword.response;
      const changePasswordErrors = changePasswordResponse.data.changePassword.errors;
      expect(changePasswordErrors).toBeNull();
      expect(changePasswordSuccess).toBeTruthy();

      const oldPassword = password;
      const failedLoginResponse = await graphqlTestCall(LOGIN, {
        loginInput: {
          email: confirmedUserData.email,
          password: oldPassword,
        },
      });
      const failedLoginData = failedLoginResponse.data.login.response;
      const failedLoginError = failedLoginResponse.data.login.errors[0];
      expect(failedLoginData).toBeNull();
      expect(failedLoginError.field).toBeNull();
      expect(failedLoginError.message).toEqual(message.auth.incorrect_password);

      const successLoginResponse = await graphqlTestCall(LOGIN, {
        loginInput: {
          email: confirmedUserData.email,
          password: newPassword,
        },
      });
      const successLoginData = successLoginResponse.data.login.response;
      const successLoginErrors = successLoginResponse.data.login.errors;
      expect(successLoginErrors).toBeNull();
      expect(successLoginData.accessToken).toBeDefined();
      expect(successLoginData.accessToken.length).toBeGreaterThan(0);
      expect(successLoginData.user.email).toEqual(confirmedUserData.email.toLowerCase());
    });
  });
});
