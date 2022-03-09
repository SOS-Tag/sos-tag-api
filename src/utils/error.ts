import { dateToString } from '@utils/date';
import type { nullableNumber } from '@utils/number';
import type { nullableString } from '@utils/string';

type Input = 'fname' | 'lname' | 'email' | 'phone' | 'password' | 'token';

enum FieldErrorTypes {
  empty = 'EMPTY',
  invalid = 'INVALID',
}

enum AuthErrorTypes {
  accountLinkExpired = 'ACCOUNT_LINK_EXPIRED',
  accountNotFound = 'ACCOUNT_NOT_FOUND',
  badLoginMethod = 'BAD_LOGIN_METHOD',
  changePasswordValidation = 'CHANGE_PASSWORD_VALIDATION_ERROR',
  confirmationValidation = 'CONFIRMATION_VALIDATION_ERROR',
  emailAlreadyExists = 'EMAIL_ALREADY_EXISTS',
  forgotPasswordValidation = 'FORGOT_PASSWORD_VALIDATION_ERROR',
  googleLoginValidation = 'GOOGLE_LOGIN_VALIDATION_ERROR',
  incorrectPasword = 'INCORRECT_PASSWORD',
  loginValidation = 'LOGIN_VALIDATION_ERROR',
  passwordLinkExpired = 'PASSWORD_LINK_EXPIRED',
  registrationValidation = 'REGISTRATION_VALIDATION_ERROR',
  resendConfirmationValidation = 'RESEND_CONFIRMATION_VALIDATION_ERROR',
  unauthenticated = 'UNAUTHENTICATED',
  unauthorized = 'UNAUTHORIZED',
  unConfirmedAccount = 'UNCONFIRMED_ACCOUNT',
}

enum InputErrorTypes {
  emptyArgs = 'EMPTY_ARGS',
}

enum SheetErrorTypes {
  sheetNotFound = 'SHEET_NOT_FOUND',
  sheetAlreadyAssigned = 'SHEET_ALREADY_ASSIGNED',
}

enum UserErrorTypes {
  userNotFound = 'USER_NOT_FOUND',
}

const ErrorTypes = { ...AuthErrorTypes, ...InputErrorTypes, ...SheetErrorTypes, ...UserErrorTypes };

type ErrorTypes = typeof ErrorTypes;

type FieldErrorType = `${FieldErrorTypes}`;

type FieldErrorsMap<Keys extends string> = {
  [K in Keys]: FieldError<K>;
};

type FieldError<T extends string> = {
  type: FieldErrorType;
  name: T;
  detail: string;
};

type FieldErrors = FieldError<Input>[];

export interface HttpError {
  code: number;
}

export interface HttpProblem extends HttpError {
  type: nullableString;
  title: string;
  message: nullableString;
  timestamp: string;
}

const isHttpError = (e: unknown): e is HttpError => {
  if (!e) return false;
  return Number.isInteger((e as HttpError).code);
};

const isHttpProblem = (e: unknown): e is HttpProblem => {
  if (!e) return false;
  return (e as HttpProblem).title !== undefined && isHttpError(e);
};

const isClientError = (e: Error): boolean => {
  return isHttpError(e) && e.code >= 400 && e.code <= 499;
};

const isServerError = (e: Error): boolean => {
  return isHttpError(e) && e.code >= 500 && e.code <= 599;
};

export class HttpErrorBase implements HttpProblem {
  type = 'INTERNAL_SERVOR_ERROR';
  code = 500;
  title = 'Internal Server Error';
  message: string;
  timestamp = dateToString(Date.now());

  constructor(message = 'The server encountered an unexpected condition that prevented it from fulfilling the request.') {
    this.message = message;
  }
}

export class BadRequest extends HttpErrorBase {
  type: string;
  code = 400;
  title = 'Bad request';

  fields: FieldErrors | null;

  constructor(
    type = 'BAD_REQUEST',
    message = 'The server cannot not process the request due to something that is perceived to be a client error (possibilities: malformed request syntax, invalid request message framing or deceptive request routing)',
    fields: FieldErrors | null = null,
  ) {
    super(message);
    this.type = type;
    this.fields = fields;
  }
}

class Conflict extends HttpErrorBase {
  type: string;
  code = 409;
  title = 'Conflict';

  constructor(
    type = 'CONFLICT',
    message = 'The server cannot not process the request due to a conflict with the current state of the target resource.',
  ) {
    super(message);
    this.type = type;
  }
}

class Forbidden extends HttpErrorBase {
  type: string;
  code = 403;
  title = 'Forbidden';

  constructor(type = 'FORBIDDEN', message = 'The server understands the request but refuses to authorize it.') {
    super(message);
    this.type = type;
  }
}

class Gone extends HttpErrorBase {
  type: string;
  code = 410;
  title = 'Gone';

  constructor(
    type = 'GONE',
    message = 'The access to the target resource is no longer available on the server (this condition is likely to be permanent).',
  ) {
    super(message);
    this.type = type;
  }
}

class InternalServerError extends HttpErrorBase {
  constructor() {
    super();
  }
}

class NotFound extends HttpErrorBase {
  type: string;
  code = 404;
  title = 'Not found';

  constructor(type = 'NOT_FOUND', message = 'The server cannot find the requested resource.') {
    super(message);
    this.type = type;
  }
}

class ServiceUnavailable extends HttpErrorBase {
  type: string;
  code = 503;
  title = 'Service Unavailable';

  retryAfter: nullableNumber;

  constructor(type = 'SERVICE_UNAVAILABLE', message = 'The server is not ready to handle the request.', retryAfter: nullableNumber = null) {
    super(message);
    this.type = type;
    this.retryAfter = retryAfter;
  }
}

class TooManyRequests extends HttpErrorBase {
  type: string;
  code = 429;
  title = 'Too Many Requests';

  retryAfter: nullableNumber;

  constructor(type = 'TOO_MANY_REQUESTS', message = 'The server has received too many requests from the client.', retryAfter: nullableNumber = null) {
    super(message);
    this.type = type;
    this.retryAfter = retryAfter;
  }
}

class Unauthorized extends HttpErrorBase {
  type: string;
  code = 401;
  title = 'Unauthorized';

  wwwAuthenticate?: nullableString;

  constructor(
    type = 'UNAUTHORIZED',
    message = 'The request has not been applied because it lacks valid authentication credentials for the target resource.',
    wwwAuthenticate: nullableString = null,
  ) {
    super(message);
    this.type = type;
    this.wwwAuthenticate = wwwAuthenticate;
  }
}

const generateBadRequestError = (customType?: string, message?: string, fields?: FieldErrors) => {
  return new BadRequest(customType, message, fields);
};

const generateConflictError = (customType?: string, message?: string) => {
  return new Conflict(customType, message);
};

const generateForbidddenError = (customType?: string, message?: string) => {
  return new Forbidden(customType, message);
};

const generateGoneError = (customType?: string, message?: string) => {
  return new Gone(customType, message);
};

const generateInternalServerError = () => {
  return new InternalServerError();
};

const generateNotFoundError = (customType?: string, message?: string) => {
  return new NotFound(customType, message);
};

const generateServiceUnavailableError = (customType?: string, message?: string, retryAfter?: number) => {
  return new ServiceUnavailable(customType, message, retryAfter);
};

const generateTooManyRequestsError = (customType?: string, message?: string, retryAfter?: number) => {
  return new TooManyRequests(customType, message, retryAfter);
};

const generateUnauthorizedError = (customType?: string, message?: string, wwwAuthenticate?: string) => {
  return new Unauthorized(customType, message, wwwAuthenticate);
};

const generateFieldErrors = (fieldErrorMessages: FieldErrorsMap<Input>) => {
  const fieldsError: FieldErrors = [];

  for (const [name, extension] of Object.entries(fieldErrorMessages)) {
    fieldsError.push({
      name: name as Input,
      type: extension.type,
      detail: extension.detail,
    });
  }

  return fieldsError;
};

const getErrorMessage = (error: unknown) => {
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;

  return 'Unknown error';
};

export type { FieldError, FieldErrors, FieldErrorsMap, Input };
export {
  ErrorTypes,
  FieldErrorTypes,
  isClientError,
  isHttpError,
  isHttpProblem,
  isServerError,
  generateBadRequestError,
  generateConflictError,
  generateFieldErrors,
  generateForbidddenError,
  generateGoneError,
  generateInternalServerError,
  generateNotFoundError,
  generateTooManyRequestsError,
  generateServiceUnavailableError,
  generateUnauthorizedError,
  getErrorMessage,
  Unauthorized,
};
