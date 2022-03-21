import redis from '@/redis';
import { __test__ } from '@constants/env';
import { confirmUserPrefix, forgotPasswordPrefix } from '@constants/redis-prefixes';
import { ChangePasswordInput, LoginInput, LoginWithGoogleInput, RegisterInput } from '@dtos/auth.dto';
import { GoogleUser } from '@interfaces/oauth.interface';
import { IUser, IUserModel } from '@models/user.model';
import { LoginResponse } from '@responses/auth.response';
import { BooleanResponse } from '@responses/common.response';
import { UserResponse } from '@responses/user.response';
import { transformUser } from '@services/utils/transform';
import { createConfirmationUrl, createForgotPasswordUrl, emailAim, generateEmailContent, sendEmail } from '@utils/email';
import { ErrorTypes, generateConflictError, generateForbidddenError, generateGoneError, generateNotFoundError } from '@utils/error';
import { getGoogleUser } from '@utils/oauth';
import { createAccessToken, createRefreshToken, sendRefreshToken } from '@utils/token';
import {
  checkChangePasswordValidity,
  checkConfirmUserValidity,
  checkForgotPasswordValidity,
  checkLoginValidity,
  checkLoginWithGoogleValidity,
  checkRegisterValidity,
  checkResendConfirmationLinkValidity,
} from '@validators/auth.validator';
import { compare, hash } from 'bcryptjs';
import { Response } from 'express';
import { Inject, Service } from 'typedi';

@Service()
class AuthService {
  constructor(@Inject('USER') private readonly users: IUserModel) {}

  async changePassword({ token, password }: ChangePasswordInput): Promise<UserResponse> {
    const errors = checkChangePasswordValidity({ token, password });
    if (errors) return errors;

    const userId = await redis.get(forgotPasswordPrefix + token);
    if (!userId)
      return {
        error: generateGoneError(
          ErrorTypes.passwordLinkExpired,
          'Password modification link has expired. A new email needs to be sent to change this account password.',
        ),
      };

    const user: IUser = await this.users.findOne({ _id: userId });
    if (!user) return { error: generateNotFoundError(ErrorTypes.accountNotFound, 'This account does not exist.') };

    await redis.del(forgotPasswordPrefix + token);

    user.password = await hash(password, 12);

    return { response: transformUser(await user.save()) };
  }

  async confirmUser(token: string): Promise<BooleanResponse> {
    const errors = checkConfirmUserValidity(token);
    if (errors) return errors;

    const userId = await redis.get(confirmUserPrefix + token);
    if (!userId)
      return {
        error: generateGoneError(
          ErrorTypes.accountLinkExpired,
          'Account confirmation link has expired. A new email needs to be sent to confirm this account.',
        ),
      };

    await this.users.findOneAndUpdate({ _id: userId }, { confirmed: true });

    await redis.del(confirmUserPrefix + token);

    return { response: true };
  }

  async forgotPassword(userEmail: string): Promise<BooleanResponse> {
    const errors = checkForgotPasswordValidity(userEmail);
    if (errors) return errors;

    const user: IUser = await this.users.findOne({ email: userEmail });
    if (!user) return { error: generateNotFoundError(ErrorTypes.accountNotFound, 'This account does not exist.') };

    if (!__test__)
      await sendEmail(
        generateEmailContent({
          aim: emailAim.changePassword,
          user: {
            name: user.fname,
            email: userEmail,
          },
          url: await createForgotPasswordUrl(user.id),
        }),
      );

    return { response: true };
  }

  async login({ email, password }: LoginInput, res: Response): Promise<LoginResponse> {
    const errors = checkLoginValidity({ email, password });
    if (errors) return errors;

    const user = await this.users.findOne({ email });
    if (!user) return { error: generateNotFoundError(ErrorTypes.accountNotFound, 'This account does not exist.') };

    if (!user.password)
      return {
        error: generateForbidddenError(
          ErrorTypes.badLoginMethod,
          `The account exists (${user.email}) but was created using your Google account, this is why there is no password associated with it. Login by using 'Login with Google'.`,
        ),
      };

    const valid = await compare(password, user.password);
    if (!valid) return { error: generateForbidddenError(ErrorTypes.incorrectPasword, 'Password is incorrect.') };

    if (!user.confirmed)
      return { error: generateForbidddenError(ErrorTypes.unConfirmedAccount, `Account must be validated by clicking the link sent to ${email}.`) };

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);

    if (!__test__) sendRefreshToken(res, refreshToken);

    return {
      response: {
        user: transformUser(user),
        accessToken,
      },
    };
  }

  async loginWithGoogle({ tokenId, token }: LoginWithGoogleInput, res: Response): Promise<LoginResponse> {
    const errors = checkLoginWithGoogleValidity({ tokenId, token });
    if (errors) return errors;

    // Get the Google user asking for connection using OAuth 2.0 client credentials (token id and access token previously retrieved.
    const googleUser: GoogleUser = await getGoogleUser({ tokenId, token });

    // We check if the Google user has already confirmed his Google account. If not, we will not handle his request.
    if (!googleUser.verified_email)
      return {
        error: generateForbidddenError(
          ErrorTypes.unConfirmedAccount,
          `Your Google email (${googleUser.email}) has not be verified. Please verify it and try to log in again`,
        ),
      };

    const user = await this.users.findOneAndUpdate(
      {
        email: googleUser.email,
      },
      {
        // If the user has already logged in using his Google email, but using the classic way (by password), do we
        // really have to replace his firstname and lastname? Indeed, it can differ from the ones he filled when he
        // previously registered.
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

  async register({ fname, lname, email, phone, password }: RegisterInput): Promise<UserResponse> {
    const error = checkRegisterValidity({ fname, lname, email, phone, password });
    if (error) return error;

    const userFound = await this.users.findOne({ email });
    if (userFound) return { error: generateConflictError(ErrorTypes.emailAlreadyExists, `An account associated to ${email} already exists.`) };

    const hashedPassword = await hash(password, 12);

    const user = await this.users.create({
      fname,
      lname,
      email,
      phone,
      password: hashedPassword,
    });

    if (!__test__)
      await sendEmail(
        generateEmailContent({
          aim: emailAim.confirmUser,
          user: {
            name: user.fname,
            email,
          },
          url: await createConfirmationUrl(user.id),
        }),
      );

    return { response: transformUser(await user.save()) };
  }

  async resendConfirmationLink(userEmail: string): Promise<BooleanResponse> {
    const errors = checkResendConfirmationLinkValidity(userEmail);
    if (errors) return errors;

    const user: IUser = await this.users.findOne({ email: userEmail });
    if (!user) return { error: generateNotFoundError(ErrorTypes.accountNotFound, 'This account does not exist.') };

    if (!__test__)
      await sendEmail(
        generateEmailContent({
          aim: emailAim.confirmUser,
          user: {
            name: user.fname,
            email: userEmail,
          },
          url: await createConfirmationUrl(user.id),
        }),
      );

    return { response: true };
  }
}

export default AuthService;
