import { faker } from '@faker-js/faker';
import { customNanoId } from '@services/qrcode.service';
import { nanoid } from 'nanoid';

const phoneNumberPattern = '07########';

const customId = customNanoId();

const confirmationToken = nanoid();
const forgotPasswordToken = nanoid();

const email = faker.internet.email();
const alreadyUsedEmail = faker.internet.email();
const unknownEmail = faker.internet.email();

const password = 'k"KM@2#x';
const newPassword = 'qY7k_6&h';
const weakPassword = '1234';

const phoneNumber = faker.phone.phoneNumber(phoneNumberPattern);
const invalidPhoneNumber = '1234567890';

const bloodType = 'O-';
const newBloodType = 'A+';

const nbOfQRCodes = faker.datatype.number({ min: 1, max: 20 });
const paginatedQRCodesOptions = {
  currentPage: 1,
  limit: Math.floor(nbOfQRCodes / 2),
};

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
  bloodType,
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
  newBloodType,
  newPassword,
  newSheetData,
  newUserData,
  paginatedQRCodesOptions,
  password,
  unknownEmail,
  weakPassword,
};
