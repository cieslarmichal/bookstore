import { IsString } from 'class-validator';
import { UserDto } from './userDto';

export class RegisterUserByEmailBodyDto {
  @IsString()
  public readonly email: string;

  @IsString()
  public readonly password: string;
}

export class RegisterUserByPhoneNumberBodyDto {
  @IsString()
  public readonly phoneNumber: string;

  @IsString()
  public readonly password: string;
}

export class RegisterUserResponseData {
  public constructor(public readonly user: UserDto) {}
}

export class RegisterUserResponseDto {
  public constructor(public readonly data: RegisterUserResponseData, public readonly statusCode: number) {}
}
