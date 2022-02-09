import { Field, ObjectType } from 'type-graphql';

@ObjectType({ description: 'Sheet Schema' })
class Sheet {
  @Field() // This is not an ObjectID
  _id: String;

  @Field()
  fname: String;

  @Field()
  lname: String;

  @Field(() => String)
  dateOfBirth: Date;

  @Field()
  nationality: String;

  @Field(() => Boolean, { defaultValue: false })
  hidden: Boolean;

  @Field()
  isInUse: Boolean;

  @Field()
  bloodType: String;

  @Field()
  smoker: Boolean;

  @Field()
  organDonor: Boolean;

  @Field()
  advanceDirectives: Boolean;

  @Field()
  allergies: String;

  @Field()
  medicalHistory: String;

  @Field()
  currentTreatment: String;

  @Field()
  treatingDoctor: String;

  @Field()
  emergencyContact1: String;

  @Field()
  emergencyContact2: String;

  @Field()
  user: String;

  @Field(() => String)
  createdAt: Date;

  @Field(() => String)
  updatedAt: Date;
}

export default Sheet;
