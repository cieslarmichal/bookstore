import { IsUUID } from 'class-validator';

export class RemoveAddressParamDto {
  @IsUUID('4')
  public readonly id: string;
}

export class RemoveAddressResponseDto {
  public constructor(public readonly statusCode: number) {}
}
