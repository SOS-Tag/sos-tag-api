import Context from '@interfaces/context.interface';
import { ErrorTypes, generateUnauthorizedError } from '@utils/error';
import 'dotenv-safe/config';
import { MiddlewareFn } from 'type-graphql';

const isAuthorized = ({ context }, role: string) => {
  return context.payload.roles.includes(role);
};

const isAuthorizedAsAdmin: MiddlewareFn<Context> = ({ context }, next) => {
  if (isAuthorized({ context }, 'admin')) {
    return next();
  } else {
    return Promise.resolve({
      error: generateUnauthorizedError(
        ErrorTypes.unauthorized,
        'You need to be authenticated and authorized to access the requested resource.',
        'Bearer',
      ),
    });
  }
};

export default isAuthorizedAsAdmin;
