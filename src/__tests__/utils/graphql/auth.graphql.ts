import { gql } from 'apollo-server-express';

const CHANGE_PASSWORD = gql`
  mutation ChangePassword($changePasswordInput: ChangePasswordInput) {
    changePassword(changePasswordInput: $changePasswordInput) {
      response {
        email
      }
      error {
        type
        code
        title
        message
        timestamp
        fields {
          type
          name
          detail
        }
      }
    }
  }
`;

const CONFIRMATION = gql`
  mutation ConfirmUser($token: String) {
    confirmUser(token: $token) {
      response
      error {
        type
        code
        title
        message
        timestamp
        fields {
          type
          name
          detail
        }
      }
    }
  }
`;

const FORGOT_PASSWORD = gql`
  mutation ForgotPassword($userEmail: String) {
    forgotPassword(userEmail: $userEmail) {
      response
      error {
        type
        code
        title
        message
        timestamp
        fields {
          type
          name
          detail
        }
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
      error {
        type
        code
        title
        message
        timestamp
        fields {
          type
          name
          detail
        }
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
      error {
        type
        code
        title
        message
        timestamp
        fields {
          type
          name
          detail
        }
      }
    }
  }
`;

const RESEND_CONFIRMATION = gql`
  mutation ResendConfirmationLink($userEmail: String) {
    resendConfirmationLink(userEmail: $userEmail) {
      response
      error {
        type
        code
        title
        message
        timestamp
        fields {
          type
          name
          detail
        }
      }
    }
  }
`;

export { CHANGE_PASSWORD, CONFIRMATION, FORGOT_PASSWORD, LOGIN, REGISTER, RESEND_CONFIRMATION };
