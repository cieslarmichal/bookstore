import { IsString, IsUUID } from 'class-validator';
import { UserDto } from './userDto';

export class SetUserPasswordBodyDto {
  @IsUUID('4')
  public readonly id: string;

  @IsString()
  public readonly password: string;
}

export class SetUserPasswordResponseData {
  public constructor(public readonly user: UserDto) {}
}

export class SetUserPasswordResponseDto {
  public constructor(public readonly data: SetUserPasswordResponseData, public readonly statusCode: number) {}
}
