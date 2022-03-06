import { gql } from 'apollo-server-express';

const UPDATE_CURRENT_USER = gql`
  mutation UpdateCurrentUser($updateCurrentUserInput: UpdateCurrentUserInput) {
    updateCurrentUser(updateCurrentUserInput: $updateCurrentUserInput) {
      response {
        fname
        lname
        address
        zipCode
        city
        email
        phone
        nationality
        password
        activated
        confirmed
      }
      errors {
        message
      }
    }
  }
`;

export { UPDATE_CURRENT_USER };
