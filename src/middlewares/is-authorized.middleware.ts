import Context from '@interfaces/context.interface';
import 'dotenv-safe/config';
import { MiddlewareFn } from 'type-graphql';

const isAuthorized = ({ context }, role: string) => {
  if (!context.payload.roles.includes(role)) {
    throw new Error('Unauthorized');
  }
};

const isAuthorizedAsAdmin: MiddlewareFn<Context> = ({ context }, next) => {
  isAuthorized({ context }, 'admin');
  return next();
};

export { isAuthorizedAsAdmin };
