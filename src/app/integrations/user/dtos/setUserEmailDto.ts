import { IsString, IsUUID } from 'class-validator';

export class SetUserEmailBodyDto {
  @IsUUID('4')
  public readonly userId: string;

  @IsString()
  public readonly email: string;
}

export class SetUserEmailResponseDto {
  public constructor(public readonly statusCode: number) {}
}
