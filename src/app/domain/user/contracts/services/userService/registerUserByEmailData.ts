import { IsString } from 'class-validator';

import { Validator } from '../../../../../common/validator/validator';

export class RegisterUserByEmailData {
  @IsString()
  public readonly email: string;

  @IsString()
  public readonly password: string;

  public constructor({ email, password }: RegisterUserByEmailData) {
    this.email = email;
    this.password = password;

    Validator.validate(this);
  }
}
