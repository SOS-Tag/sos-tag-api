import { faker } from '@faker-js/faker';
import { customNanoId } from '@services/qrcode.service';
import { nanoid } from 'nanoid';

const phoneNumberPattern = '07########';

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
  enabled: true,
  ...initialUserFullName,
  sex: 'F',
  dateOfBirth: '1980-11-20T00:00:00.000Z',
  nationality: 'FR',
  bloodType: 'A-',
  smoker: false,
  organDonor: false,
  advanceDirectives: false,
  allergies: 'Pollen',
  medicalHistory: 'Anomalie cardiaque repérée',
  currentTreatment: 'Radiothérapie',
  treatingDoctor: {
    fname: 'Antonio',
    lname: 'Sanchez',
    phone: '',
  },
  emergencyContacts: [
    {
      fname: 'Clément',
      lname: 'Robert',
      role: 'Compagnon',
      phone: '0309792080',
    },
    {
      fname: 'Thomas',
      lname: 'Robert',
      role: 'Frère',
      phone: '0354215688',
    },
  ],
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
