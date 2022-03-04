import { IsString } from 'class-validator';

export class LoginUserData {
  @IsString()
  public readonly email: string;

  @IsString()
  public readonly password: string;
}
