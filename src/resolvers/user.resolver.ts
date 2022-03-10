import { UpdateCurrentUserInput, UpdateUserInput } from '@/dtos/user.dto';
import isAuthenticated from '@/middlewares/is-authenticated.middleware';
import { isAuthorizedAsAdmin } from '@/middlewares/is-authorized.middleware';
import { QueryOptions } from '@dtos/common.dto';
import Context from '@interfaces/context.interface';
import { PaginatedUsersResponse, UserResponse } from '@responses/user.response';
import UserSchema from '@schemas/user.schema';
import UserService from '@services/user.service';
import { getErrorMessage } from '@utils/error';
import { logger } from '@utils/logger';
import { verify } from 'jsonwebtoken';
import { Arg, Ctx, Mutation, Query, Resolver, UseMiddleware } from 'type-graphql';
import { Service } from 'typedi';

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;

@Service()
@Resolver(() => UserSchema)
class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => UserResponse, { description: 'Get the user currently logged in.' })
  async currentUser(@Ctx() { req }: Context): Promise<UserResponse> {
    const authorization = req.headers['authorization'];
    if (!authorization) {
      return null;
    }

    try {
      const token = authorization.split(' ')[1];
      const payload: any = verify(token, accessTokenSecret);
      const currentUser = await this.userById(payload.userId);
      return currentUser;
    } catch (error) {
      logger.error(`[resolver:User:currentUser] ${getErrorMessage(error)}.`);
      return null;
    }
  }

  @Mutation(() => UserResponse, { description: 'Update the currently logged in user.' })
  @UseMiddleware(isAuthenticated)
  async updateCurrentUser(
    @Ctx() { payload }: Context,
    @Arg('updateCurrentUserInput') updateCurrentUserInput: UpdateCurrentUserInput,
  ): Promise<UserResponse> {
    try {
      const updateCurrentUserResponse = await this.userService.updateCurrentUser(updateCurrentUserInput, payload.userId);
      return updateCurrentUserResponse;
    } catch (error) {
      logger.error(`[resolver:User:updateCurrentUser] ${getErrorMessage(error)}.`);
      throw error;
    }
  }

  @Mutation(() => UserResponse, { description: 'Update user.' })
  @UseMiddleware(isAuthenticated, isAuthorizedAsAdmin)
  async updateUser(@Ctx() { payload }: Context, @Arg('updateUserInput') updateUserInput: UpdateUserInput): Promise<UserResponse> {
    try {
      const updateUserResponse = await this.userService.updateUser(updateUserInput, payload.userId);
      return updateUserResponse;
    } catch (error) {
      logger.error(`[resolver:User:updateUser] ${getErrorMessage(error)}.`);
      throw error;
    }
  }

  @Query(() => UserResponse, { description: 'Get a user by his id.' })
  @UseMiddleware(isAuthenticated, isAuthorizedAsAdmin)
  async userById(@Arg('userId') userId: string): Promise<UserResponse> {
    try {
      const user = await this.userService.findUserById(userId);
      return user;
    } catch (error) {
      logger.error(`[resolver:User:userByID] ${getErrorMessage(error)}.`);
      throw error;
    }
  }

  @Query(() => PaginatedUsersResponse, { description: 'Get all users.' })
  // @UseMiddleware(isAuthenticated, isAuthorizedAsAdmin)
  async allUsers(@Arg('options') options?: QueryOptions): Promise<PaginatedUsersResponse> {
    try {
      const users = await this.userService.findUsers(options || {});
      return users;
    } catch (error) {
      logger.error(`[resolver:User:users] ${getErrorMessage(error)}.`);
      throw error;
    }
  }
}

export default UserResolver;
