import { faker } from '@faker-js/faker';
import { customNanoId } from '@services/qrcode.service';

const phoneNumberPattern = '07########';

const alreadyUsedEmail = faker.internet.email();
const customId = customNanoId();
const password = 'k"KM@2#x';
const unknownEmail = faker.internet.email();

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
  phone: faker.phone.phoneNumber(phoneNumberPattern),
  confirmed: true,
};

const newSheetData = {
  ...initialUserFullName,
  bloodType: 'O-',
};

const newUserData = {
  ...newUserFullName,
  email: faker.internet.email(),
  phone: faker.phone.phoneNumber(phoneNumberPattern),
  password,
};

export { alreadyUsedEmail, customId, initialUserData, newSheetData, newUserData, password, unknownEmail };
