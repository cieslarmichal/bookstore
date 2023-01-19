import { IsString } from 'class-validator';

export class RegisterUserByPhoneNumberData {
  @IsString()
  public readonly phoneNumber: string;

  @IsString()
  public readonly password: string;
}
