import { IsUUID } from 'class-validator';

export class RemoveUserParamDto {
  @IsUUID('4')
  public readonly id: string;
}

export class RemoveUserResponseDto {
  public constructor(public readonly statusCode: number) {}
}
