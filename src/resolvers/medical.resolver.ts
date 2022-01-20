import { UserResponse, UsersResponse } from '@responses/user.response';
import {addMedicalDataInput} from '@dtos/medical.dto'
import Context from '@interfaces/context.interface';
import { isAuth } from '@middlewares/is-auth.middleware';
import UserSchema from '@schemas/user.schema';
import  MedicalService  from '@/services/medical.service';
import { logger } from '@utils/logger';
import { verify } from 'jsonwebtoken';
import { Arg, Ctx, Mutation, Query, Resolver, UseMiddleware } from 'type-graphql';
import { Service } from 'typedi';
import { LoginResponse } from '@/responses/auth.response';

@Service()
@Resolver(() => UserSchema)
class MedicalResolver {
    constructor(private readonly medicalService: MedicalService) {}

    @Mutation(() => UserResponse, { description: 'Add Medical Data to user by ID.' })
    async addMedicalData(
        @Arg("_id") _id: String,
        @Arg('addMedicalDataInput') addMedicalDataInput: addMedicalDataInput, 
        @Ctx() { req }: Context): Promise<UserResponse>{
      try {
        const addMedicalDataResponse = await this.medicalService.addMedicalData(_id, addMedicalDataInput, req);
        return addMedicalDataResponse;
      } catch (error) {
        logger.error(`[resolver:User:userByID] ${error.message}.`);
        throw error;
      }
    }
}
export default MedicalResolver