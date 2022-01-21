import { Field, ID, ObjectType } from 'type-graphql';
import User from './user.schema';

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
  medData: {
    sex: { value: String; hidden: boolean };
    height: { value: String; hidden: boolean };
    bloodGroup: { value: String; hidden: boolean };
    advanceDirectives: { value: String; hidden: boolean };
    drugAllergies: { value: String; hidden: boolean };
    organsDonation: { value: String; hidden: boolean };
    currentTreatment: { value: String; hidden: boolean };
    smoking: { value: String; hidden: boolean };
    antecedents: { value: String; hidden: boolean };
    utdVaccines: { value: String; hidden: boolean };
    diabetes: { value: String; hidden: boolean };
    haemophilia: { value: String; hidden: boolean };
    epilepsy: { value: String; hidden: boolean };
    pacemaker: { value: String; hidden: boolean };
  };

  @Field(() => Boolean, { defaultValue: false })
  activated: boolean;

  @Field()
  affectedTo: User;

  @Field(() => String)
  createdAt: Date;

  @Field(() => String)
  updatedAt: Date;
}

export default Sheet;
