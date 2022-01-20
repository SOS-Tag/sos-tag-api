import { IUser, IUserModel } from '@models/user.model';
import { UserResponse } from '@responses/user.response';
import { Request, Response } from 'express';
import { transformUser } from '@services/utils/transform';
import { Inject, Service } from 'typedi';
import {addMedicalDataInput} from '@dtos/medical.dto'
import { Arg } from 'type-graphql';

@Service()
class MedicalService{
    constructor(@Inject('USER') private readonly users: IUserModel) {}
    async addMedicalData(@Arg("_id", () => String) _id: String,
        @Arg("input", () => addMedicalDataInput) input: addMedicalDataInput, 
        req: Request
    ) : Promise<UserResponse> {
        const user: IUser = await this.users.findOne({ _id: _id });
        console.log(user)
        if (!user)
            return {
                errors: [
                {
                    message: req.t('auth.account_does_not_exist'),
                },
                ],
            };
        await this.users.findOneAndUpdate({_id}, input);
        return { response: transformUser(await user.save()) };
    }
}

export default MedicalService