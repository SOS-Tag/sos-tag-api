import { RegisterInput } from '@dtos/auth.dto';
import { IUser, IUserModel } from '@models/user.model';
import { BooleanResponse } from '@responses/common.response';
import { UserResponse } from '@responses/user.response';
import { transformUser } from '@services/utils/transform';
import { sendEmail } from '@utils/email';
import { checkDeleteAccountValidity, checkForgotPasswordValidity, checkRegisterValidity } from '@validators/auth.validator';
import { Request } from 'express';
import { Inject, Service } from 'typedi';
import firebaseAdmin from '../firebase';

@Service()
class AuthService {
  constructor(@Inject('USER') private readonly users: IUserModel) {}

  async deleteAccount(userId: string, req: Request): Promise<BooleanResponse> {
    const errors = checkDeleteAccountValidity(userId, req);
    if (errors) return errors;

    const firebaseUser = await firebaseAdmin.auth.getUser(userId);
    const user: IUser = await this.users.findById(userId);

    if (!user && !firebaseUser)
      return {
        errors: [
          {
            message: req.t('auth.account_does_not_exist'),
          },
        ],
      };

    if (firebaseUser) {
      await firebaseAdmin.auth.deleteUser(userId);
    }

    if (user) {
      // Does it remove the possible referenced objects in it?
      await this.users.deleteOne({ _id: userId });
    }

    return { response: true };
  }

  async forgotPassword(userEmail: string, req: Request): Promise<BooleanResponse> {
    const errors = checkForgotPasswordValidity(userEmail, req);
    if (errors) return errors;

    // Not working...
    const user: IUser = await this.users.findOne({ email: userEmail });
    if (!user)
      return {
        errors: [
          {
            message: req.t('auth.account_does_not_exist'),
          },
        ],
      };

    const actionLink = await firebaseAdmin.auth.generatePasswordResetLink(userEmail);

    await sendEmail('change_password', user.firstname, userEmail, actionLink, req);

    return { response: true };
  }

  async register({ firstname, lastname, email, phone, password }: RegisterInput, req: Request): Promise<UserResponse> {
    const errors = checkRegisterValidity({ firstname, lastname, email, phone, password }, req);
    if (errors) return errors;

    try {
      const firebaseUser = await firebaseAdmin.auth.createUser({
        email,
        password,
        emailVerified: false,
      });

      if (firebaseUser) {
        const user = await this.users.create({
          _id: firebaseUser.uid,
          firstname,
          lastname,
          email,
          phone,
        });

        const actionLink = await firebaseAdmin.auth.generateEmailVerificationLink(firebaseUser.email);

        await sendEmail('confirm_user', firstname, email, actionLink, req);

        return { response: transformUser(await user.save()) };
      }
    } catch (error) {
      if (error.code === 'auth/email-already-exists') {
        return {
          errors: [
            {
              message: req.t('auth.account_already_exist', { email }),
            },
          ],
        };
      }

      throw error;
    }
  }
}

export default AuthService;
