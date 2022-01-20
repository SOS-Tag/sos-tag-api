import { Field, InputType } from 'type-graphql';

@InputType({ description: 'Add medical data Input' })
class addMedicalDataInput {
    @Field(() => String, {nullable: true})
    bloodGroup: String | null;
  
    @Field(() => Boolean, {nullable: true})
    advanceDirectives: Boolean | null;
  
    @Field(() => Boolean, {nullable: true})
    smoking: Boolean;
  
    @Field(() => Boolean, {nullable: true})
    organsDonation: Boolean | null;
  
    @Field(() => Boolean, {nullable: true})
    utdVaccines: Boolean | null;
  
    @Field(() => Boolean, {nullable: true})
    diabetes: Boolean | null;
  
    @Field(() => Boolean, {nullable: true})
    haemophilia: Boolean | null;
  
    @Field(() => Boolean, {nullable: true})
    epilepsy: Boolean | null;
  
    @Field(() => Boolean, {nullable: true})
    pacemaker: Boolean | null;
}

export {addMedicalDataInput}