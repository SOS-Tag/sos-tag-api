import { dateToString } from '@utils/date';

const transformQRCode = qrCode => {
  return {
    ...qrCode._doc,
    _id: qrCode.id,
    createdAt: dateToString(qrCode.createdAt),
    updatedAt: dateToString(qrCode.updatedAt),
  };
};

const transformSheet = sheet => {
  return {
    ...sheet._doc,
    _id: sheet.id,
    dateOfBirth: dateToString(sheet.dateOfBirth),
    createdAt: dateToString(sheet.createdAt),
    updatedAt: dateToString(sheet.updatedAt),
  };
};

const transformUser = user => {
  return {
    ...user._doc,
    _id: user.id,
    // We want to overwrite the password with a null value to avoid
    // returning it (even if it is a hash, it can cause security issues)
    password: null,
    createdAt: dateToString(user.createdAt),
    updatedAt: dateToString(user.updatedAt),
  };
};

export { transformQRCode, transformSheet, transformUser };
