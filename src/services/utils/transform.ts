import { dateToString } from '@utils/date';

const transformSheet = sheet => {
  return {
    ...sheet._doc,
    _id: sheet.id,
    ...(sheet.dateOfBirth && { dateOfBirth: dateToString(sheet.dateOfBirth) }),
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

export { transformSheet, transformUser };
