import { gql } from 'apollo-server-express';

const ALL_SHEETS = gql`
  query AllSheets {
    allSheets {
      response {
        items {
          _id
        }
        totalItems
        currentPage
        totalPages
        hasMore
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

const ASSIGN_SHEET_TO_USER = gql`
  mutation AssignSheetToUser($assignSheetToUserInput: AssignSheetToUserInput) {
    assignSheetToUser(assignSheetToUserInput: $assignSheetToUserInput) {
      response {
        _id
        enabled
        user
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

const CREATE_SHEET = gql`
  mutation CreateSheet($count: Float) {
    createSheet(count: $count) {
      response {
        _id
        enabled
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

const SHEETS_CURRENT_USER = gql`
  query SheetsCurrentUser {
    sheetsCurrentUser {
      response {
        _id
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

export { ALL_SHEETS, ASSIGN_SHEET_TO_USER, CREATE_SHEET, SHEET_BY_ID, SHEET_BY_SCANNING, SHEETS_CURRENT_USER, UPDATE_SHEET };
