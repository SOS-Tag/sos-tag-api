import { IsEmail } from 'class-validator';
import { Field, InputType } from 'type-graphql';

@InputType({ description: 'Change password input' })
class ChangePasswordInput {
  @Field()
  token: string;
  @Field()
  password: string;
}

@InputType({ description: 'Login input' })
class LoginInput {
  @Field()
  @IsEmail()
  email: string;
  @Field()
  password: string;
}

@InputType({ description: 'Login with Google input' })
class LoginWithGoogleInput {
  @Field()
  tokenId: string;
  @Field()
  token: string;
}

@InputType({ description: 'Register input' })
class RegisterInput {
  @Field()
  fname: string;
  @Field()
  lname: string;
  @Field()
  email: string;
  @Field()
  phone: string;
  @Field()
  password: string;
}

export { ChangePasswordInput, LoginInput, LoginWithGoogleInput, RegisterInput };
