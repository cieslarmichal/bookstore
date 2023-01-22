import { IsString } from 'class-validator';

import { Validator } from '../../../../../common/validator/validator';

export class LoginUserByPhoneNumberData {
  @IsString()
  public readonly phoneNumber: string;

  @IsString()
  public readonly password: string;

  public constructor({ phoneNumber, password }: LoginUserByPhoneNumberData) {
    this.phoneNumber = phoneNumber;
    this.password = password;

    Validator.validate(this);
  }
}
