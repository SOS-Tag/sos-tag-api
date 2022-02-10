import Context from '@interfaces/context.interface';
import 'dotenv-safe/config';
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';
import { MiddlewareFn } from 'type-graphql';
import firebaseAdmin from '../firebase';

export const isAuth: MiddlewareFn<Context> = async ({ context }, next) => {
  try {
    const firebaseToken = context.req.headers.authorization?.split(' ')[1];

    let firebaseUser: DecodedIdToken;

    if (firebaseToken) {
      firebaseUser = await firebaseAdmin.auth.verifyIdToken(firebaseToken);
    }

    if (!firebaseUser) {
      // Unauthorized
      throw new Error('Not authenticated');
    }

    context.payload = { userId: firebaseUser.uid };

    return next();
  } catch (err) {
    // Unauthorized
    throw new Error('Not authenticated');
  }
};
