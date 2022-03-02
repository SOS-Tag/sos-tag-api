import { IUser } from '@models/user.model';
import { SingleObjectResponse } from '@responses/common.response';
import UserSchema from '@schemas/user.schema';
import { Field, ObjectType } from 'type-graphql';

@ObjectType({ description: 'Login response data' })
class LoginResponseData {
  @Field(() => UserSchema)
  user: IUser;
  @Field(() => String)
  accessToken: string;
}

@ObjectType({ description: 'Login response' })
class LoginResponse extends SingleObjectResponse(LoginResponseData) {}

export { LoginResponse, LoginResponseData };
