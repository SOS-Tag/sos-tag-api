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

export { UPDATE_CURRENT_USER };
