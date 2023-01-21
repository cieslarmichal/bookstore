import { IsUUID } from 'class-validator';

export class RemoveCategoryParamDto {
  @IsUUID('4')
  public readonly id: string;
}

export class RemoveCategoryResponseDto {
  public constructor(public readonly statusCode: number) {}
}
