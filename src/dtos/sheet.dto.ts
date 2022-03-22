import { Field, InputType } from 'type-graphql';
import { IsDate } from 'class-validator';

@InputType({ description: 'Sheet doctor contact field to be changed with an update operation' })
class SheetDoctorContactInput {
  @Field()
  fname: string;
  @Field()
  lname: string;
  @Field()
  phone: string;
}

@InputType({ description: 'Sheet emergency contact field to be changed with an update operation' })
class SheetContactInput {
  @Field()
  fname: string;
  @Field()
  lname: string;
  @Field()
  role: string;
  @Field()
  phone: string;
}

@InputType({ description: 'Assign sheet to user input' })
class AssignSheetToUserInput {
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
  treatingDoctor: SheetDoctorContactInput;
  @Field(() => [SheetContactInput])
  emergencyContacts: SheetContactInput[];
}

@InputType({ description: 'Sheet fields to be changed with an update operation by the user' })
class UpdateCurrentUserSheetChangesInput {
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
  treatingDoctor: SheetDoctorContactInput;
  @Field(() => [SheetContactInput])
  emergencyContacts: SheetContactInput[];
}

@InputType({ description: 'Update Sheet as user input' })
class UpdateCurrentUserSheetInput {
  @Field()
  id: string;
  @Field()
  changes: UpdateCurrentUserSheetChangesInput;
}

@InputType({ description: 'Sheet fields to be changed with an update operation by the admin' })
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
  treatingDoctor: SheetDoctorContactInput;
  @Field(() => [SheetContactInput])
  emergencyContacts: SheetContactInput[];
  @Field()
  user: string;
}

@InputType({ description: 'Update Sheet as admin input' })
class UpdateSheetInput {
  @Field()
  id: string;
  @Field()
  changes: UpdateSheetChangesInput;
}

@InputType({ description: 'Create sheets from ids input' })
class CreateSheetsFromIdsInput {
  @Field(() => [String])
  ids: string[];
}

export { AssignSheetToUserInput, CreateSheetsFromIdsInput, UpdateCurrentUserSheetInput, UpdateSheetInput };
