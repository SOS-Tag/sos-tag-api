import { gql } from 'apollo-server-express';

const CREATE_QRCODE = gql`
  mutation CreateQRCode {
    createQRCode {
      response {
        _id
        inUse
      }
      errors {
        field
        message
      }
    }
  }
`;

const PAGINATED_QRCODES = gql`
  query QrCodesWithPagination($paginatorInput: PaginatorInput) {
    qrCodesWithPagination(paginatorInput: $paginatorInput) {
      items {
        _id
      }
      errors {
        field
        message
      }
      currentPage
      totalPages
      hasMore
    }
  }
`;

const QRCODES = gql`
  query QrCodes {
    qrCodes {
      response {
        _id
        inUse
      }
      errors {
        field
        message
      }
    }
  }
`;

export { CREATE_QRCODE, PAGINATED_QRCODES, QRCODES };
