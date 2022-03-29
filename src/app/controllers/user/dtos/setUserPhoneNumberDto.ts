import { IsString, IsUUID } from 'class-validator';

export class SetUserPhoneNumberBodyDto {
  @IsUUID('4')
  public readonly userId: string;

  @IsString()
  public readonly phoneNumber: string;
}

export class SetUserPhoneNumberResponseDto {
  public constructor(public readonly statusCode: number) {}
}
