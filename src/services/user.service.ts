import { UpdateCurrentUserInput } from '@/dtos/user.dto';
import { IUser, IUserModel } from '@models/user.model';
import { BooleanResponse } from '@responses/common.response';
import { UserResponse, UsersResponse } from '@responses/user.response';
import { transformUser } from '@services/utils/transform';
import { denest, isEmpty } from '@utils/object';
import { Inject, Service } from 'typedi';

@Service()
class UserService {
  constructor(@Inject('USER') private readonly users: IUserModel) {}

  async findUserById(userId: string): Promise<UserResponse> {
    if (isEmpty(userId))
      return {
        errors: [
          {
            message: 'Empty userId parameter.',
          },
        ],
      };

    const user: IUser = await this.users.findById(userId);
    if (!user)
      return {
        errors: [
          {
            message: 'User not found.',
          },
        ],
      };

    return { response: transformUser(user) };
  }

  async findUsers(): Promise<UsersResponse> {
    const users: IUser[] = await this.users.find();
    return { response: users.map(user => transformUser(user)) };
  }

  async revokeRefreshTokensByUserId(userId: string): Promise<BooleanResponse> {
    if (isEmpty(userId))
      return {
        errors: [
          {
            message: 'Empty userId parameter.',
          },
        ],
      };

    const updatedUser = await this.users.findByIdAndUpdate(userId, { $inc: { tokenVersion: 1 } });
    if (!updatedUser)
      return {
        errors: [
          {
            message: 'User not found.',
          },
        ],
      };

    return { response: true };
  }

  async updateCurrentUser(updateUserInput: UpdateCurrentUserInput, userId: string): Promise<UserResponse> {
    const user = await this.users.findOneAndUpdate(
      {
        _id: userId,
      },
      denest(updateUserInput),
      {
        new: true,
      },
    );

    if (!user)
      return {
        errors: [
          {
            message: 'User not found.',
          },
        ],
      };

    return { response: transformUser(user) };
  }
}

export default UserService;
