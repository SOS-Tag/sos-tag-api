import { Field, ID, Int, ObjectType } from 'type-graphql';
import Sheet from './sheet.schema';

@ObjectType({ description: 'User Schema' })
class User {
  @Field(() => ID)
  _id: String;

  @Field()
  fname: String;

  @Field()
  lname: String;

  @Field()
  email: String;

  @Field()
  phone: String;

  @Field()
  nationality: String;

  @Field()
  password: String;

  @Field(() => Int, { defaultValue: 0 })
  tokenVersion: Number;

  @Field(() => Boolean, { defaultValue: false })
  activated: boolean;

  @Field(() => Boolean, { defaultValue: false })
  confirmed: boolean;

  @Field(() => [Sheet]) //TODO Check if that is correct
  sheets: Sheet[];

  @Field(() => String)
  createdAt: Date;

  @Field(() => String)
  updatedAt: Date;
}

export default User;
