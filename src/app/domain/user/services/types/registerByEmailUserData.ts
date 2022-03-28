import { IsString } from 'class-validator';

export class RegisterByEmailUserData {
  @IsString()
  public readonly email: string;

  @IsString()
  public readonly password: string;
}
