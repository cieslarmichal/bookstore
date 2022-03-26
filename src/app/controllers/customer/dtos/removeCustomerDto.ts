import { IsUUID } from 'class-validator';

export class RemoveCustomerParamDto {
  @IsUUID('4')
  public readonly id: string;
}

export class RemoveCustomerResponseDto {
  public constructor(public readonly statusCode: number) {}
}
