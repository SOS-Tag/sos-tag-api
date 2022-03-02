import { gql } from 'apollo-server-express';

const CHANGE_PASSWORD = gql`
  mutation ChangePassword($changePasswordInput: ChangePasswordInput) {
    changePassword(changePasswordInput: $changePasswordInput) {
      response {
        email
      }
      errors {
        field
        message
      }
    }
  }
`;

const CONFIRMATION = gql`
  mutation ConfirmUser($token: String) {
    confirmUser(token: $token) {
      response
      errors {
        field
        message
      }
    }
  }
`;

const FORGOT_PASSWORD = gql`
  mutation ForgotPassword($userEmail: String) {
    forgotPassword(userEmail: $userEmail) {
      response
      errors {
        field
        message
      }
    }
  }
`;

const LOGIN = gql`
  mutation Login($loginInput: LoginInput) {
    login(loginInput: $loginInput) {
      response {
        accessToken
        user {
          email
        }
      }
      errors {
        field
        message
      }
    }
  }
`;

const REGISTER = gql`
  mutation Register($registerInput: RegisterInput) {
    register(registerInput: $registerInput) {
      response {
        _id
        fname
        lname
        email
      }
      errors {
        field
        message
      }
    }
  }
`;

const RESEND_CONFIRMATION = gql`
  mutation ResendConfirmationLink($userEmail: String) {
    resendConfirmationLink(userEmail: $userEmail) {
      response
      errors {
        field
        message
      }
    }
  }
`;

export { CHANGE_PASSWORD, CONFIRMATION, FORGOT_PASSWORD, LOGIN, REGISTER, RESEND_CONFIRMATION };
