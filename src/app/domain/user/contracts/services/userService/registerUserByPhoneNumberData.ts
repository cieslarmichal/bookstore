import { IsString } from 'class-validator';

import { Validator } from '../../../../../common/validator/validator';

export class RegisterUserByPhoneNumberData {
  @IsString()
  public readonly phoneNumber: string;

  @IsString()
  public readonly password: string;

  public constructor({ phoneNumber, password }: RegisterUserByPhoneNumberData) {
    this.phoneNumber = phoneNumber;
    this.password = password;

    Validator.validate(this);
  }
}
