import { IsString } from 'class-validator';

export class RegisterUserData {
  @IsString()
  public readonly email: string;

  @IsString()
  public readonly password: string;
}
