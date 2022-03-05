import { Field, ObjectType } from 'type-graphql';

@ObjectType({ description: 'Sheet Treating Doctor Contact Schema' })
class SheetDoctorContact {
  @Field()
  fname: String;
  @Field()
  lname: String;
  @Field()
  phone: String;
}

@ObjectType({ description: 'Sheet Contact Schema' })
class SheetContact {
  @Field()
  fname: String;
  @Field()
  lname: String;
  @Field()
  role: String;
  @Field()
  phone: String;
}

@ObjectType({ description: 'Sheet Schema' })
class Sheet {
  @Field() // This is not an ObjectID
  _id: String;

  @Field(() => Boolean, { defaultValue: true })
  enabled: Boolean;

  @Field()
  fname: String;

  @Field()
  lname: String;

  @Field()
  sex: String;

  @Field(() => String)
  dateOfBirth: Date;

  @Field()
  nationality: String;

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
  treatingDoctor: SheetDoctorContact;

  @Field()
  emergencyContact1: SheetContact;

  @Field()
  emergencyContact2: SheetContact;

  @Field()
  user: String;

  @Field(() => String)
  createdAt: Date;

  @Field(() => String)
  updatedAt: Date;
}

export default Sheet;
