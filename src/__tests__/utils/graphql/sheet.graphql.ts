import { gql } from 'apollo-server-express';

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

const CREATE_SHEET = gql`
  mutation CreateSheet($count: Float) {
    createSheet(count: $count) {
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

const SHEET_BY_ID = gql`
  query SheetById($sheetId: String) {
    sheetById(sheetId: $sheetId) {
      response {
        enabled
        _id
        fname
        lname
        sex
        dateOfBirth
        nationality
        bloodType
        smoker
        organDonor
        advanceDirectives
        allergies
        medicalHistory
        currentTreatment
        treatingDoctor {
          fname
          lname
          phone
        }
        emergencyContacts {
          fname
          lname
          role
          phone
        }
      }
      errors {
        field
        message
      }
    }
  }
`;

const SHEET_BY_SCANNING = gql`
  query SheetByScanning($sheetId: String) {
    sheetByScanning(sheetId: $sheetId) {
      response {
        enabled
        _id
        fname
        lname
        sex
        dateOfBirth
        nationality
        bloodType
        smoker
        organDonor
        advanceDirectives
        allergies
        medicalHistory
        currentTreatment
        treatingDoctor {
          fname
          lname
          phone
        }
        emergencyContacts {
          fname
          lname
          role
          phone
        }
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
  mutation UpdateCurrentUserSheet($updateCurrentUserSheetInput: UpdateCurrentUserSheetInput) {
    updateCurrentUserSheet(updateCurrentUserSheetInput: $updateCurrentUserSheetInput) {
      response {
        enabled
        fname
        lname
        sex
        dateOfBirth
        nationality
        bloodType
        smoker
        organDonor
        advanceDirectives
        allergies
        medicalHistory
        currentTreatment
        treatingDoctor {
          fname
          lname
          phone
        }
        emergencyContacts {
          fname
          lname
          role
          phone
        }
      }
      errors {
        field
        message
      }
    }
  }
`;

export { ASSIGN_SHEET_TO_USER, CREATE_SHEET, SHEET_BY_ID, SHEET_BY_SCANNING, SHEETS, SHEETS_CURRENT_USER, UPDATE_SHEET };
