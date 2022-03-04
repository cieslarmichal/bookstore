import { IsUUID } from 'class-validator';

export class RemoveBookParamDto {
  @IsUUID('4')
  public readonly id: string;
}

export class RemoveBookResponseDto {
  public constructor(public readonly statusCode: number) {}
}
