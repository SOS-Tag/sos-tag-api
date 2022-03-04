import { ChangePasswordInput, LoginInput, LoginWithGoogleInput, RegisterInput } from '@dtos/auth.dto';
import { isEmpty } from '@utils/object';
import { generateFieldErrors } from '@validators/utils/errors';
import { emptyArgsExist, invalidArgsExist } from '@validators/utils/validate';

const checkChangePasswordValidity = (changePasswordInput: ChangePasswordInput) => {
  const emptyArgs = emptyArgsExist(changePasswordInput);
  if (!isEmpty(emptyArgs)) return generateFieldErrors(emptyArgs);

  const { password } = changePasswordInput;
  const invalidArgs = invalidArgsExist({ password });
  if (!isEmpty(invalidArgs)) return generateFieldErrors(invalidArgs);
};

const checkConfirmUserValidity = (token: string) => {
  const emptyArgs = emptyArgsExist({ token });
  if (!isEmpty(emptyArgs)) return generateFieldErrors(emptyArgs);
};

const checkForgotPasswordValidity = (email: string) => {
  const emptyArgs = emptyArgsExist({ email });
  if (!isEmpty(emptyArgs)) return generateFieldErrors(emptyArgs);
};

const checkLoginValidity = (loginInput: LoginInput) => {
  const emptyArgs = emptyArgsExist(loginInput);
  if (!isEmpty(emptyArgs)) return generateFieldErrors(emptyArgs);
};

const checkLoginWithGoogleValidity = (loginWithGoogleInput: LoginWithGoogleInput) => {
  const emptyArgs = emptyArgsExist(loginWithGoogleInput);
  if (!isEmpty(emptyArgs)) return generateFieldErrors(emptyArgs);
};

const checkRegisterValidity = (registerInput: RegisterInput) => {
  const emptyArgs = emptyArgsExist(registerInput);
  if (!isEmpty(emptyArgs)) return generateFieldErrors(emptyArgs);

  const { email, phone, password } = registerInput;
  const invalidArgs = invalidArgsExist({ email, phone, password });
  if (!isEmpty(invalidArgs)) return generateFieldErrors(invalidArgs);
};

const checkResendConfirmationLinkValidity = (email: string) => {
  const emptyArgs = emptyArgsExist({ email });
  if (!isEmpty(emptyArgs)) return generateFieldErrors(emptyArgs);
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
