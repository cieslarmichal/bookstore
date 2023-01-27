import { IsString, IsEnum, IsUUID, IsOptional } from 'class-validator';

import { UserRole } from './userRole';
import { Validator } from '../../../common/validator/validator';

export class User {
  @IsUUID('4')
  public readonly id: string;

  @IsOptional()
  @IsString()
  public readonly email?: string | undefined;

  @IsOptional()
  @IsString()
  public readonly phoneNumber?: string | undefined;

  @IsString()
  public readonly password: string;

  @IsEnum(UserRole)
  public readonly role: UserRole;

  public constructor({ id, email, phoneNumber, password, role }: User) {
    this.id = id;
    this.password = password;
    this.role = role;

    if (email) {
      this.email = email;
    }

    if (phoneNumber) {
      this.phoneNumber = phoneNumber;
    }

    Validator.validate(this);
  }
}
