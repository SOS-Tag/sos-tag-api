import { confirmUserPrefix, forgotPasswordPrefix } from '@constants/redis-prefixes';
import { ChangePasswordInput, LoginInput, LoginWithGoogleInput, RegisterInput } from '@dtos/auth.dto';
import { GoogleUser } from '@interfaces/oauth.interface';
import { IUser, IUserModel } from '@models/user.model';
import { LoginResponse } from '@responses/auth.response';
import { BooleanResponse } from '@responses/common.response';
import { UserResponse } from '@responses/user.response';
import { transformUser } from '@services/utils/transform';
import { createConfirmationUrl, createForgotPasswordUrl, sendEmail } from '@utils/email';
import { getGoogleUser } from '@utils/oauth';
import { createAccessToken, createRefreshToken, sendRefreshToken } from '@utils/token';
import {
  checkChangePasswordValidity,
  checkConfirmUserValidity,
  checkForgotPasswordValidity,
  checkLoginValidity,
  checkLoginWithGoogleValidity,
  checkRegisterValidity,
} from '@validators/auth.validator';
import { compare, hash } from 'bcryptjs';
import { Request, Response } from 'express';
import { Inject, Service } from 'typedi';
import { redis } from '../redis';

@Service()
class AuthService {
  constructor(@Inject('USER') private readonly users: IUserModel) {}

  async changePassword({ token, password }: ChangePasswordInput, req: Request): Promise<UserResponse> {
    const errors = checkChangePasswordValidity({ token, password }, req);
    if (errors) return errors;

    const userId = await redis.get(forgotPasswordPrefix + token);
    if (!userId)
      return {
        errors: [
          {
            message: req.t('auth.password_modification_expired'),
          },
        ],
      };

    const user: IUser = await this.users.findOne({ _id: userId });
    if (!user)
      return {
        errors: [
          {
            message: req.t('auth.account_does_not_exist'),
          },
        ],
      };

    await redis.del(forgotPasswordPrefix + token);

    user.password = await hash(password, 12);

    return { response: transformUser(await user.save()) };
  }

  async confirmUser(token: string, req: Request): Promise<BooleanResponse> {
    const errors = checkConfirmUserValidity(token, req);
    if (errors) return errors;

    const userId = await redis.get(confirmUserPrefix + token);
    if (!userId)
      return {
        errors: [
          {
            message: req.t('auth.account_confirmation_expired'),
          },
        ],
      };

    await this.users.findOneAndUpdate({ _id: userId }, { confirmed: true });

    await redis.del(confirmUserPrefix + token);

    return { response: true };
  }

  async forgotPassword(userEmail: string, req: Request): Promise<BooleanResponse> {
    const errors = checkForgotPasswordValidity(userEmail, req);
    if (errors) return errors;

    const user: IUser = await this.users.findOne({ email: userEmail });
    if (!user)
      return {
        errors: [
          {
            message: req.t('auth.account_does_not_exist'),
          },
        ],
      };

    await sendEmail('change_password', user.fname, userEmail, await createForgotPasswordUrl(user.id), req);

    return { response: true };
  }

  async login({ email, password }: LoginInput, req: Request, res: Response): Promise<LoginResponse> {
    const errors = checkLoginValidity({ email, password }, req);
    if (errors) return errors;

    const user = await this.users.findOne({ email });
    if (!user)
      return {
        errors: [
          {
            message: req.t('auth.account_does_not_exist'),
          },
        ],
      };

    const valid = await compare(password, user.password);
    if (!valid)
      return {
        errors: [
          {
            message: req.t('auth.incorrect_password'),
          },
        ],
      };

    if (!user.confirmed)
      return {
        errors: [
          {
            message: req.t('auth.unvalidated_account', { email }),
          },
        ],
      };

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);

    sendRefreshToken(res, refreshToken);

    return {
      response: {
        user: transformUser(user),
        accessToken,
      },
    };
  }

  async loginWithGoogle({ tokenId, token }: LoginWithGoogleInput, req: Request, res: Response): Promise<LoginResponse> {
    const errors = checkLoginWithGoogleValidity({ tokenId, token }, req);
    if (errors) return errors;

    const googleUser: GoogleUser = await getGoogleUser({ tokenId, token });

    if (!googleUser.verified_email)
      return {
        errors: [
          {
            message: req.t('auth.unvalidated_account', { email: googleUser.email }),
          },
        ],
      };

    const user = await this.users.findOneAndUpdate(
      {
        email: googleUser.email,
      },
      {
        // Question: if the user has already logged in using his Google email, but using the classic way (by password), do we
        // really have to replace his firstname and lastname? Indeed, it can differ from the ones he filled when he registered.
        fname: googleUser.given_name,
        lname: googleUser.family_name,
        email: googleUser.email,
        confirmed: true,
      },
      {
        upsert: true,
        new: true,
      },
    );

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);

    sendRefreshToken(res, refreshToken);

    return {
      response: {
        user: transformUser(user),
        accessToken,
      },
    };
  }

  async logout(res: Response): Promise<BooleanResponse> {
    sendRefreshToken(res, '');
    return { response: true };
  }

  async register({ fname, lname, email, phone, password }: RegisterInput, req: Request): Promise<UserResponse> {
    const errors = checkRegisterValidity({ fname, lname, email, phone, password }, req);
    if (errors) return errors;

    const userFound = await this.users.findOne({ email });
    if (userFound)
      return {
        errors: [
          {
            message: req.t('auth.account_already_exist', { email }),
          },
        ],
      };

    const hashedPassword = await hash(password, 12);

    const user = await this.users.create({
      fname,
      lname,
      email,
      phone,
      password: hashedPassword,
    });

    await sendEmail('confirm_user', fname, email, await createConfirmationUrl(user.id), req);

    return { response: transformUser(await user.save()) };
  }
}

export default AuthService;
