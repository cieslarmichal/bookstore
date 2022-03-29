import { IsString } from 'class-validator';

export class RegisterUserByEmailData {
  @IsString()
  public readonly email: string;

  @IsString()
  public readonly password: string;
}
