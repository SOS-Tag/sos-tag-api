import Context from '@interfaces/context.interface';
import { generateUnauthorizedError } from '@utils/error';
import 'dotenv-safe/config';
import { verify } from 'jsonwebtoken';
import { MiddlewareFn } from 'type-graphql';

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;

const isAuthenticated: MiddlewareFn<Context> = ({ context }, next) => {
  const authorization = context.req.headers['authorization'];

  if (!authorization) {
    return Promise.resolve({
      error: generateUnauthorizedError('You need to be authenticated to access the requested resource.', 'Bearer'),
    });
  }

  try {
    const [, token] = authorization.split(' ');
    const payload = verify(token, accessTokenSecret);
    context.payload = payload as any;
  } catch (err) {
    return Promise.resolve({
      error: generateUnauthorizedError('You need to be authenticated to access the requested resource.', 'Bearer'),
    });
  }

  return next();
};

export default isAuthenticated;
