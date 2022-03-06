import { IsString, IsUUID } from 'class-validator';

export class SetUserPasswordBodyDto {
  @IsUUID('4')
  public readonly userId: string;

  @IsString()
  public readonly password: string;
}
export class SetUserPasswordResponseDto {
  public constructor(public readonly statusCode: number) {}
}
