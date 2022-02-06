import { RegisterInput } from '@dtos/auth.dto';
import Context from '@interfaces/context.interface';
import { BooleanResponse } from '@responses/common.response';
import { UserResponse } from '@responses/user.response';
import UserSchema from '@schemas/user.schema';
import AuthService from '@services/auth.service';
import { logger } from '@utils/logger';
import { Arg, Ctx, Mutation, Query, Resolver } from 'type-graphql';
import { Service } from 'typedi';

@Service()
@Resolver(() => UserSchema)
class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Query(() => String, { description: 'Return a simple welcoming message.' })
  async welcome(@Ctx() { req }: Context): Promise<string> {
    try {
      return req.t('greetings.welcome', { what: 'SOS-Tag API (alpha version)' });
    } catch (error) {
      throw error;
    }
  }

  @Mutation(() => BooleanResponse, {
    description: 'Delete an account',
  })
  async deleteAccount(@Arg('accountId') accountId: string, @Ctx() { req }: Context): Promise<BooleanResponse> {
    try {
      const deleteAccountResponse = await this.authService.deleteAccount(accountId, req);
      return deleteAccountResponse;
    } catch (error) {
      logger.error(`[resolver:Auth:deleteAccount] ${error.message}`);
      throw error;
    }
  }

  @Mutation(() => BooleanResponse, {
    description: 'Send an email containing a link that redirect to change password dedicated route on Firebase.',
  })
  async forgotPassword(@Arg('userEmail') userEmail: string, @Ctx() { req }: Context): Promise<BooleanResponse> {
    try {
      const forgotPasswordResponse = await this.authService.forgotPassword(userEmail, req);
      return forgotPasswordResponse;
    } catch (error) {
      logger.error(`[resolver:Auth:forgotPassword] ${error.message}`);
      throw error;
    }
  }

  @Mutation(() => UserResponse, {
    description:
      'Register a new user. To complete the registration, the user will have to confirm his account by following the link that has been sent to him by email.',
  })
  async register(@Arg('registerInput') registerInput: RegisterInput, @Ctx() { req }: Context): Promise<UserResponse> {
    try {
      const registerResponse = await this.authService.register(registerInput, req);
      return registerResponse;
    } catch (error) {
      logger.error(`[resolver:Auth:register] ${error.message}`);
      throw error;
    }
  }
}

export default AuthResolver;
