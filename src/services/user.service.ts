import { UpdateCurrentUserInput, UpdateUserInput } from '@/dtos/user.dto';
import { ErrorTypes, generateBadRequestError, generateFieldErrors, generateNotFoundError } from '@/utils/error';
import { emptyArgsExist } from '@/validators/utils/validate';
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
    const emptyArgs = emptyArgsExist({ userId });
    if (!isEmpty(emptyArgs))
      return { error: generateBadRequestError(ErrorTypes.emptyArgs, 'The userId is missing.', generateFieldErrors(emptyArgs)) };

    const user: IUser = await this.users.findById(userId);
    if (!user) return { error: generateNotFoundError(ErrorTypes.userNotFound, 'This user does not exist.') };

    return { response: transformUser(user) };
  }

  async findUsers(): Promise<UsersResponse> {
    const users: IUser[] = await this.users.find();
    return { response: users.map(user => transformUser(user)) };
  }

  async revokeRefreshTokensByUserId(userId: string): Promise<BooleanResponse> {
    const emptyArgs = emptyArgsExist({ userId });
    if (!isEmpty(emptyArgs))
      return { error: generateBadRequestError(ErrorTypes.emptyArgs, 'The userId is missing.', generateFieldErrors(emptyArgs)) };

    const updatedUser = await this.users.findByIdAndUpdate(userId, { $inc: { tokenVersion: 1 } });
    if (!updatedUser) return { error: generateNotFoundError(ErrorTypes.userNotFound, 'This user does not exist.') };

    return { response: true };
  }

  async updateCurrentUser(updateCurrentUserInput: UpdateCurrentUserInput, userId: string): Promise<UserResponse> {
    const user = await this.users.findOneAndUpdate(
      {
        _id: userId,
      },
      denest(updateCurrentUserInput),
      {
        new: true,
      },
    );

    if (!user) return { error: generateNotFoundError(ErrorTypes.userNotFound, 'This user does not exist.') };

    return { response: transformUser(user) };
  }

  async updateUser(updateUserInput: UpdateUserInput, userId: string): Promise<UserResponse> {
    const user = await this.users.findOneAndUpdate(
      {
        _id: userId,
      },
      denest(updateUserInput),
      {
        new: true,
      },
    );

    if (!user) return { error: generateNotFoundError(ErrorTypes.userNotFound, 'This user does not exist.') };

    return { response: transformUser(user) };
  }
}

export default UserService;
