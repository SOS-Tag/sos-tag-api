import { Field, InputType } from 'type-graphql';

@InputType({ description: 'Update currently logged in user input' })
class UpdateCurrentUserInput {
  @Field()
  fname: string;
  @Field()
  lname: string;
  @Field()
  address: string;
  @Field()
  zipCode: string;
  @Field()
  city: string;
  @Field()
  email: string;
  @Field()
  phone: string;
  @Field()
  nationality: string;
  @Field()
  password: string;
  @Field()
  activated: boolean;
}

@InputType({ description: 'Update user input' })
class UpdateUserInput {
  @Field()
  fname: string;
  @Field()
  lname: string;
  @Field()
  address: string;
  @Field()
  zipCode: string;
  @Field()
  city: string;
  @Field()
  email: string;
  @Field()
  phone: string;
  @Field()
  nationality: string;
  @Field(() => [String])
  roles: string;
  @Field()
  password: string;
  @Field()
  activated: boolean;
  @Field()
  confirmed: boolean;
  @Field()
  tokenVersion: number;
}

export { UpdateCurrentUserInput, UpdateUserInput };
