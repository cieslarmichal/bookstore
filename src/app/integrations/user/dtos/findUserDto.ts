import { IsUUID } from 'class-validator';
import { UserDto } from './userDto';

export class FindUserParamDto {
  @IsUUID('4')
  public readonly id: string;
}

export class FindUserResponseData {
  public constructor(public readonly user: UserDto) {}
}

export class FindUserResponseDto {
  public constructor(public readonly data: FindUserResponseData, public readonly statusCode: number) {}
}
