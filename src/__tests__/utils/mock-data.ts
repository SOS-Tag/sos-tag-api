import { faker } from '@faker-js/faker';
import { customNanoId } from '@services/qrcode.service';
import { nanoid } from 'nanoid';

const phoneNumberPattern = '07########';

const alreadyUsedEmail = faker.internet.email();
const confirmationToken = nanoid();
const customId = customNanoId();
const email = faker.internet.email();
const forgotPasswordToken = nanoid();
const invalidPhoneNumber = '1234567890';
const nbOfQRCodes = faker.datatype.number({ min: 1, max: 20 });
const newPassword = 'qY7k_6&h';
const paginatedQRCodesOptions = {
  currentPage: 1,
  limit: Math.floor(nbOfQRCodes / 2),
};
const password = 'k"KM@2#x';
const phoneNumber = faker.phone.phoneNumber(phoneNumberPattern);
const unknownEmail = faker.internet.email();
const weakPassword = '1234';

const initialUserFullName = {
  fname: faker.name.firstName(),
  lname: faker.name.lastName(),
};

const newUserFullName = {
  fname: faker.name.firstName(),
  lname: faker.name.lastName(),
};

const initialUserData = {
  ...initialUserFullName,
  email: alreadyUsedEmail,
  phone: phoneNumber,
};

const newSheetData = {
  ...initialUserFullName,
  bloodType: 'O-',
};

const newUserData = {
  ...newUserFullName,
  email,
  phone: phoneNumber,
  password,
};

export {
  alreadyUsedEmail,
  confirmationToken,
  customId,
  forgotPasswordToken,
  initialUserData,
  invalidPhoneNumber,
  nbOfQRCodes,
  newPassword,
  newSheetData,
  newUserData,
  paginatedQRCodesOptions,
  password,
  unknownEmail,
  weakPassword,
};
