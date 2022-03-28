import { IsString } from 'class-validator';

export class RegisterByPhoneNumberUserData {
  @IsString()
  public readonly phoneNumber: string;

  @IsString()
  public readonly password: string;
}
