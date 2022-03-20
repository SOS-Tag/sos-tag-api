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
        user {
          _id
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

const DELETE_SHEET = gql`
  mutation DeleteCurrentUserSheet($sheetId: String) {
    deleteCurrentUserSheet(sheetId: $sheetId) {
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

const SHEET_BY_ID = gql`
  query Sheet($id: String) {
    Sheet(id: $id) {
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
  mutation UpdateCurrentUserSheet($updateInput: UpdateUserSheetInput) {
    updateCurrentUserSheet(updateInput: $updateInput) {
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

export { ASSIGN_SHEET_TO_USER, CREATE_SHEET, DELETE_SHEET, SHEET_BY_ID, SHEET_BY_SCANNING, SHEETS, SHEETS_CURRENT_USER, UPDATE_SHEET };
