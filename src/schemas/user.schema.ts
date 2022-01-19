import { Field, ID, Int, ObjectType } from 'type-graphql';

@ObjectType({ description: 'User Schema' })
class User {
  @Field(() => ID)
  _id: String;

  @Field()
  firstname: String;

  @Field()
  lastname: String;

  @Field()
  email: String;

  @Field()
  phone: String;

  @Field()
  password: String;

  @Field(() => Int, { defaultValue: 0 })
  tokenVersion: Number;

  @Field(() => Boolean, { defaultValue: false })
  confirmed: boolean;

  @Field(() => String)
  createdAt: Date;

  @Field(() => String)
  updatedAt: Date;

  @Field()
  sex: String;

  @Field()
  birthday: Date;

  @Field()
  height: Number;

  @Field()
  weight: Number;

  @Field()
  bloodGroup: String;

  @Field()
  advanceDirectives: Boolean;

  @Field()
  smoking: Boolean;

  @Field()
  drugAllergies: String[];

  @Field()
  antecedents: String[];

  @Field()
  utdVaccines: Boolean;

  @Field()
  diabetes: Boolean;

  @Field()
  haemophilia: Boolean;

  @Field()
  epilepsy: Boolean;

  @Field()
  pacemaker: Boolean;
}

export default User;
