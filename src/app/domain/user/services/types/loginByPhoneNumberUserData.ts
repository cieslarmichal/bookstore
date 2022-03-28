import { IsString } from 'class-validator';

export class LoginByPhoneNumberUserData {
  @IsString()
  public readonly phoneNumber: string;

  @IsString()
  public readonly password: string;
}
