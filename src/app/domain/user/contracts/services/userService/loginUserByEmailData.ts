import { IsString } from 'class-validator';

import { Validator } from '../../../../../common/validator/validator';

export class LoginUserByEmailData {
  @IsString()
  public readonly email: string;

  @IsString()
  public readonly password: string;

  public constructor({ email, password }: LoginUserByEmailData) {
    this.email = email;
    this.password = password;

    Validator.validate(this);
  }
}
