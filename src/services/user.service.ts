import { UpdateCurrentUserInput, UpdateUserInput } from '@/dtos/user.dto';
import { ErrorTypes, generateBadRequestError, generateFieldErrors, generateNotFoundError } from '@/utils/error';
import { IUser, IUserModel } from '@models/user.model';
import { BooleanResponse } from '@responses/common.response';
import { PaginatedUsersResponse, UserResponse } from '@responses/user.response';
import { transformUser } from '@services/utils/transform';
import { denest, isEmpty } from '@utils/object';
import { SortOrder } from '@utils/sort';
import { emptyArgsExist } from '@validators/utils/validate';
import { Inject, Service } from 'typedi';
import { QueryOptions } from '../dtos/common.dto';

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

  async findUsers({ filter, pagination, sort }: QueryOptions): Promise<PaginatedUsersResponse> {
    const users: IUser[] = await this.users
      .find(filter && { [filter.field]: filter.value })
      .limit(pagination?.limit * 1 || 0)
      .skip((pagination?.page - 1) * pagination?.limit || 0)
      .sort(sort && { [sort.field]: sort.order === SortOrder.ascending ? 1 : -1 })
      .exec();

    let totalItems = 0;

    if (!isEmpty(filter)) {
      const matchedUsers = await this.users.find({ [filter.field]: { $regex: filter.value } });
      totalItems = matchedUsers.length;
    } else {
      totalItems = await this.users.countDocuments();
    }

    const totalPages = Math.ceil(totalItems / pagination?.limit) || 1;
    const currentPage = pagination?.page || 1;
    const hasMore = pagination?.page < totalPages || false;

    return {
      response: {
        items: users.map(user => transformUser(user)),
        totalItems,
        totalPages,
        currentPage,
        hasMore,
      },
    };
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
