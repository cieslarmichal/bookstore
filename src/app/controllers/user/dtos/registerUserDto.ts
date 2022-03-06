import { IsString } from 'class-validator';
import { UserDto } from './userDto';

export class RegisterUserBodyDto {
  @IsString()
  public readonly email: string;

  @IsString()
  public readonly password: string;
}

export class RegisterUserResponseData {
  public constructor(public readonly user: UserDto) {}
}

export class RegisterUserResponseDto {
  public constructor(public readonly data: RegisterUserResponseData, public readonly statusCode: number) {}
}
