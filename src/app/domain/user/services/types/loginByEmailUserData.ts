import { IsString } from 'class-validator';

export class LoginByEmailUserData {
  @IsString()
  public readonly email: string;

  @IsString()
  public readonly password: string;
}
