import { Field, ID, ObjectType } from 'type-graphql';

@ObjectType({ description: 'Nested medical data element object' })
class MedDataElement {
  @Field()
  value: string;

  @Field()
  hidden: boolean;
}

@ObjectType({ description: 'Nested medical data object' })
export class MedData {
  @Field() sex: MedDataElement;
  @Field() height: MedDataElement;
  @Field() bloodGroup: MedDataElement;
  @Field() advanceDirectives: MedDataElement;
  @Field() drugAllergies: MedDataElement;
  @Field() organsDonation: MedDataElement;
  @Field() currentTreatment: MedDataElement;
  @Field() smoking: MedDataElement;
  @Field() antecedents: MedDataElement;
  @Field() utdVaccines: MedDataElement;
  @Field() diabetes: MedDataElement;
  @Field() haemophilia: MedDataElement;
  @Field() epilepsy: MedDataElement;
  @Field() pacemaker: MedDataElement;
}

@ObjectType({ description: 'Sheet Schema' })
class Sheet {
  @Field(() => ID)
  _id: String;

  @Field()
  fname: String;

  @Field()
  lname: String;

  @Field(() => String)
  dateOfBirth: Date;

  @Field()
  nationality: String;

  @Field()
  medData: MedData;

  @Field(() => Boolean, { defaultValue: false })
  hidden: boolean;

  @Field()
  isInUse: boolean;

  @Field(() => String)
  createdAt: Date;

  @Field(() => String)
  updatedAt: Date;
}

export default Sheet;
