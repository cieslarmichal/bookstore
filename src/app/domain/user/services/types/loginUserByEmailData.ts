import { IsString } from 'class-validator';

export class LoginUserByEmailData {
  @IsString()
  public readonly email: string;

  @IsString()
  public readonly password: string;
}
