import UserSchema from '@schemas/user.schema';
import { Field, ObjectType } from 'type-graphql';
import { IPaginationDetails, ObjectsResponse, PaginatedResponse, SingleObjectResponse } from '@responses/common.response';

@ObjectType({ implements: IPaginationDetails, description: 'User after paginaation was applied' })
class PaginatedUsers extends IPaginationDetails {
  @Field(() => [UserSchema])
  items: UserSchema[];
}

@ObjectType({ description: 'User response' })
class UserResponse extends SingleObjectResponse(UserSchema) {}

@ObjectType({ description: 'Users response' })
class UsersResponse extends ObjectsResponse(UserSchema) {}

@ObjectType({ description: 'Paginated users response' })
class PaginatedUsersResponse extends PaginatedResponse(PaginatedUsers) {}

export { PaginatedUsersResponse, UserResponse, UsersResponse };
