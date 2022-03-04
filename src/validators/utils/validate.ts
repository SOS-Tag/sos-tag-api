import { ChangePasswordInput, LoginInput, LoginWithGoogleInput, RegisterInput } from '@dtos/auth.dto';
import CustomRegex from '@interfaces/custom-regex.interface';
import { isEmpty } from '@utils/object';
import { capitalizeFirstLetter, containsOnlySpaces } from '@utils/string';
import { emailRegex, passwordRegex, phoneRegex } from '@validators/utils/regex';

type PotentialyEmptyArgs = ChangePasswordInput | LoginInput | LoginWithGoogleInput | RegisterInput | { token: string } | { email: string };
type PotentialyInvalidArgs = Pick<ChangePasswordInput, 'password'> | LoginInput | Omit<RegisterInput, 'fname' | 'lname'>;

const validators = {
  isEmailValid: function (input: string) {
    return isValid(input, emailRegex);
  },
  isPasswordValid: function (input: string) {
    return isValid(input, passwordRegex);
  },
  isPhoneValid: function (input: string) {
    return isValid(input, phoneRegex);
  },
};

const isValid = (input: string, customRegex: CustomRegex): string | null => {
  if (!customRegex.regex.test(input)) return customRegex.errorMessage;
  return null;
};

const emptyArgsExist = (input: PotentialyEmptyArgs): Record<string, string> => {
  const emptyArgs = {};
  for (const [key, value] of Object.entries(input)) {
    if (isEmpty(value) || containsOnlySpaces(value)) {
      emptyArgs[key] = `The ${key} is required.`;
    }
  }
  return emptyArgs;
};

const invalidArgsExist = (input: PotentialyInvalidArgs): Record<string, string> => {
  const invalidArgs = {};
  for (const [key, value] of Object.entries(input)) {
    const validator = `is${capitalizeFirstLetter(key)}Valid`;

    if (!Object.keys(validators).includes(validator))
      throw new Error(`${capitalizeFirstLetter(key)} has no corresponding validator method (${validator} function not found)`);

    const error = validators[validator](value);

    if (error) {
      invalidArgs[key] = error;
    }
  }
  return invalidArgs;
};

export { emptyArgsExist, invalidArgsExist, validators };
