import { Field, InputType } from 'type-graphql';

@InputType({ description: 'User fields to be changed with an update operation' })
class UpdateUserChangesInput {
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
  id: string;
  @Field()
  changes: UpdateUserChangesInput;
}

export { UpdateUserInput };
