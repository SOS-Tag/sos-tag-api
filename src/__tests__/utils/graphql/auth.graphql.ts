import { gql } from 'apollo-server-express';

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

export { CONFIRMATION, LOGIN, REGISTER };
