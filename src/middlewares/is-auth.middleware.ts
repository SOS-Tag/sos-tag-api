import Context from '@interfaces/context.interface';
import 'dotenv-safe/config';
import { verify } from 'jsonwebtoken';
import { MiddlewareFn } from 'type-graphql';

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;

const isAuth: MiddlewareFn<Context> = ({ context }, next) => {
  const authorization = context.req.headers['authorization'];

  if (!authorization) {
    throw new Error('Unauthenticated');
  }

  try {
    const token = authorization.split(' ')[1];
    const payload = verify(token, accessTokenSecret);
    context.payload = payload as any;
  } catch (err) {
    throw new Error('Unauthenticated');
  }

  return next();
};

export default isAuth;
