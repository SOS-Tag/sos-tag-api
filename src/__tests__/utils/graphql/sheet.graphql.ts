import { gql } from 'apollo-server-express';

const CREATE_SHEET = gql`
  mutation CreateSheet($sheetId: String) {
    createSheet(sheetId: $sheetId) {
      response {
        _id
        enabled
      }
      errors {
        field
        message
      }
    }
  }
`;

const ASSIGN_SHEET_TO_USER = gql`
  mutation AssignSheetToUser($assignSheetToUserInput: AssignSheetToUserInput) {
    assignSheetToUser(assignSheetToUserInput: $assignSheetToUserInput) {
      response {
        _id
        enabled
        user
      }
      errors {
        message
      }
    }
  }
`;

const SHEET_BY_ID = gql`
  query SheetById($sheetId: String) {
    sheetById(sheetId: $sheetId) {
      response {
        _id
        fname
        lname
        bloodType
      }
      errors {
        field
        message
      }
    }
  }
`;

const SHEETS = gql`
  query Sheets {
    sheets {
      response {
        _id
      }
      errors {
        field
        message
      }
    }
  }
`;

const SHEETS_CURRENT_USER = gql`
  query SheetsCurrentUser {
    sheetsCurrentUser {
      response {
        _id
      }
      errors {
        field
        message
      }
    }
  }
`;

const UPDATE_SHEET = gql`
  mutation UpdateSheet($updateSheetInput: UpdateSheetInput) {
    updateSheet(updateSheetInput: $updateSheetInput) {
      response {
        bloodType
      }
      errors {
        field
        message
      }
    }
  }
`;

export { CREATE_SHEET, ASSIGN_SHEET_TO_USER, SHEET_BY_ID, SHEETS, SHEETS_CURRENT_USER, UPDATE_SHEET };
