import { QRCODE_LENGTH } from '@services/qrcode.service';
import { createConnection } from '@utils/mongoose';
import { CREATE_QRCODE, PAGINATED_QRCODES, QRCODES } from '@__tests__/utils/graphql/qrcode.graphql';
import { initialUserData, nbOfQRCodes, paginatedQRCodesOptions, password } from '@__tests__/utils/mock-data';
import { graphqlTestCall, logTestUserIn, registerTestUser, teardown } from '@__tests__/utils/set-up';

let accessToken: string | undefined = undefined;

beforeAll(async () => {
  await createConnection();

  const registeredUser = await registerTestUser(initialUserData, password);

  accessToken = await logTestUserIn({
    email: registeredUser.email,
    password,
  });
});

afterAll(async () => {
  await teardown();
});

describe('QR Code service', () => {
  describe('Creation', () => {
    test(`successful with all newly created codes unused (e.g. not already assigned) and specific ID length (equal to ${QRCODE_LENGTH})`, async () => {
      for (let i = 0; i < nbOfQRCodes; i++) {
        const response = await graphqlTestCall(CREATE_QRCODE);
        const data = response.data.createQRCode.response;
        const errors = response.data.createQRCode.errors;
        expect(errors).toBeNull();
        expect(data._id.length).toBe(QRCODE_LENGTH);
        expect(data.inUse).toBeFalsy();
      }
    });
  });
  describe('Retrieve all', () => {
    test('unsuccessful when user is not logged in', async () => {
      const response = await graphqlTestCall(QRCODES, undefined, undefined);
      const error = response.errors[0];
      expect(response.data.qrCodes).toBeNull();
      expect(error.message).toEqual('Unauthenticated');
    });
    test('successful when user is logged in', async () => {
      const response = await graphqlTestCall(QRCODES, undefined, accessToken);
      const data = response.data.qrCodes.response;
      const errors = response.data.qrCodes.errors;
      expect(errors).toBeNull();
      expect(data).toBeInstanceOf(Array);
      expect(data.length).toEqual(nbOfQRCodes);
    });
  });
  describe('Retrieve with pagination', () => {
    test('unsuccessful when user is not logged in', async () => {
      const response = await graphqlTestCall(PAGINATED_QRCODES, undefined, undefined);
      const error = response.errors[0];
      expect(response.data.qrCodesWithPagination).toBeNull();
      expect(error.message).toEqual('Unauthenticated');
    });
    test('successful when user is logged in, with expected current page, total pages, has more information and total QR codes by page', async () => {
      const response = await graphqlTestCall(
        PAGINATED_QRCODES,
        {
          paginatorInput: {
            page: paginatedQRCodesOptions.currentPage,
            limit: paginatedQRCodesOptions.limit,
          },
        },
        accessToken,
      );

      const totalPages = Math.ceil(nbOfQRCodes / paginatedQRCodesOptions.limit);
      const hasMore = paginatedQRCodesOptions.currentPage < totalPages;

      const { errors, ...data } = response.data.qrCodesWithPagination;

      expect(errors).toBeNull();
      expect(data.currentPage).toEqual(paginatedQRCodesOptions.currentPage);
      expect(data.totalPages).toEqual(totalPages);
      expect(data.hasMore).toEqual(hasMore);
      expect(data.items.length).toEqual(paginatedQRCodesOptions.limit);
    });
  });
});
