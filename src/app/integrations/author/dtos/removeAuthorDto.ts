import { IsUUID } from 'class-validator';

export class RemoveAuthorParamDto {
  @IsUUID('4')
  public readonly id: string;
}

export class RemoveAuthorResponseDto {
  public constructor(public readonly statusCode: number) {}
}
