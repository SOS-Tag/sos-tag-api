import { Field, InputType } from 'type-graphql';
import { IsDate } from 'class-validator';

@InputType({ description: 'Create Sheet input' })
class CreateSheetInput {
  @Field()
  id: string;
  @Field()
  enabled: boolean;
  @Field()
  fname: string;
  @Field()
  lname: string;
  @Field()
  sex: string;
  @Field()
  @IsDate()
  dateOfBirth: Date;
  @Field()
  nationality: string;
  @Field()
  bloodType: string;
  @Field()
  smoker: boolean;
  @Field()
  organDonor: boolean;
  @Field()
  advanceDirectives: boolean;
  @Field()
  allergies: string;
  @Field()
  medicalHistory: string;
  @Field()
  currentTreatment: string;
  @Field()
  treatingDoctor: string;
  @Field()
  emergencyContact1: string;
  @Field()
  emergencyContact2: string;
}

@InputType({ description: 'Sheet fields to be changed with an update operation' })
class UpdateSheetChangesInput {
  @Field()
  enabled: boolean;
  @Field()
  fname: string;
  @Field()
  lname: string;
  @Field()
  sex: string;
  @Field()
  @IsDate()
  dateOfBirth: Date;
  @Field()
  nationality: string;
  @Field()
  bloodType: string;
  @Field()
  smoker: boolean;
  @Field()
  organDonor: boolean;
  @Field()
  advanceDirectives: boolean;
  @Field()
  allergies: string;
  @Field()
  medicalHistory: string;
  @Field()
  currentTreatment: string;
  @Field()
  treatingDoctor: string;
  @Field()
  emergencyContact1: string;
  @Field()
  emergencyContact2: string;
}

@InputType({ description: 'Update Sheet input' })
class UpdateSheetInput {
  @Field()
  id: string;
  changes: UpdateSheetChangesInput;
}

export { CreateSheetInput, UpdateSheetInput };
