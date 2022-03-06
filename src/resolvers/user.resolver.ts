import { UpdateCurrentUserInput } from '@/dtos/user.dto';
import Context from '@interfaces/context.interface';
import isAuth from '@middlewares/is-auth.middleware';
import { UserResponse, UsersResponse } from '@responses/user.response';
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
  @UseMiddleware(isAuth)
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

  @Query(() => UserResponse, { description: 'Get a user by his id.' })
  @UseMiddleware(isAuth)
  async userById(@Arg('userId') userId: string): Promise<UserResponse> {
    try {
      const user = await this.userService.findUserById(userId);
      return user;
    } catch (error) {
      logger.error(`[resolver:User:userByID] ${getErrorMessage(error)}.`);
      throw error;
    }
  }

  @Query(() => UsersResponse, { description: 'Get all users.' })
  @UseMiddleware(isAuth)
  async users(): Promise<UsersResponse> {
    try {
      const users = await this.userService.findUsers();
      return users;
    } catch (error) {
      logger.error(`[resolver:User:users] ${getErrorMessage(error)}.`);
      throw error;
    }
  }
}

export default UserResolver;
