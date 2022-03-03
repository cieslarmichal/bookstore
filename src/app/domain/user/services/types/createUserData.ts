import { IsEnum, IsString } from 'class-validator';
import { UserRole } from '../../types';

export class CreateUserData {
  @IsString()
  public readonly email: string;

  @IsString()
  public readonly password: string;

  @IsEnum(UserRole)
  public readonly role: UserRole;
}
