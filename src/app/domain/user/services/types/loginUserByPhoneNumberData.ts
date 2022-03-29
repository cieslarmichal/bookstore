import { IsString } from 'class-validator';

export class LoginUserByPhoneNumberData {
  @IsString()
  public readonly phoneNumber: string;

  @IsString()
  public readonly password: string;
}
