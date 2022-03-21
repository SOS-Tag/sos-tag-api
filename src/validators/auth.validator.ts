import { ChangePasswordInput, LoginInput, LoginWithGoogleInput, RegisterInput } from '@dtos/auth.dto';
import { ErrorTypes, generateBadRequestError, generateFieldErrors } from '@utils/error';
import { isEmpty } from '@utils/object';
import { emptyArgsExist, invalidArgsExist } from '@validators/utils/validate';

const checkChangePasswordValidity = (changePasswordInput: ChangePasswordInput) => {
  const emptyArgs = emptyArgsExist(changePasswordInput);

  const { password } = changePasswordInput;
  const invalidArgs = invalidArgsExist({ password });

  if (!isEmpty(emptyArgs) || !isEmpty(invalidArgs))
    return {
      error: generateBadRequestError(
        ErrorTypes.changePasswordValidation,
        'Some of the inputs provided for changing the password are malformed.',
        generateFieldErrors({ ...invalidArgs, ...emptyArgs }),
      ),
    };
};

const checkConfirmUserValidity = (token: string) => {
  const emptyArgs = emptyArgsExist({ token });

  if (!isEmpty(emptyArgs))
    return {
      error: generateBadRequestError(
        ErrorTypes.confirmationValidation,
        'The token provided to confirm the user account is missing.',
        generateFieldErrors(emptyArgs),
      ),
    };
};

const checkForgotPasswordValidity = (email: string) => {
  const emptyArgs = emptyArgsExist({ email });

  if (!isEmpty(emptyArgs))
    return {
      error: generateBadRequestError(
        ErrorTypes.forgotPasswordValidation,
        "The email provided to generate the 'Forgot password' link is missing.",
        generateFieldErrors(emptyArgs),
      ),
    };
};

const checkLoginValidity = (loginInput: LoginInput) => {
  const emptyArgs = emptyArgsExist(loginInput);
  if (!isEmpty(emptyArgs))
    return {
      error: generateBadRequestError(
        ErrorTypes.loginValidation,
        'Some of the inputs provided for log in are missing.',
        generateFieldErrors(emptyArgs),
      ),
    };
};

const checkLoginWithGoogleValidity = (loginWithGoogleInput: LoginWithGoogleInput) => {
  const emptyArgs = emptyArgsExist(loginWithGoogleInput);
  if (!isEmpty(emptyArgs))
    return {
      error: generateBadRequestError(
        ErrorTypes.googleLoginValidation,
        'Some of the inputs provided for log in using Google are missing.',
        generateFieldErrors(emptyArgs),
      ),
    };
};

const checkRegisterValidity = (registerInput: RegisterInput) => {
  const emptyArgs = emptyArgsExist(registerInput);

  const { email, phone, password } = registerInput;
  const invalidArgs = invalidArgsExist({ email, phone, password });

  if (!isEmpty(emptyArgs) || !isEmpty(invalidArgs))
    return {
      error: generateBadRequestError(
        ErrorTypes.registrationValidation,
        'Some of the inputs provided for registration are missing or malformed.',
        generateFieldErrors({ ...invalidArgs, ...emptyArgs }),
      ),
    };
};

const checkResendConfirmationLinkValidity = (email: string) => {
  const emptyArgs = emptyArgsExist({ email });
  if (!isEmpty(emptyArgs))
    return {
      error: generateBadRequestError(
        ErrorTypes.resendConfirmationValidation,
        'The email provided to resend a confirmation link is missing.',
        generateFieldErrors(emptyArgs),
      ),
    };
};

export {
  checkChangePasswordValidity,
  checkConfirmUserValidity,
  checkForgotPasswordValidity,
  checkLoginValidity,
  checkLoginWithGoogleValidity,
  checkRegisterValidity,
  checkResendConfirmationLinkValidity,
};
