import { IsUUID } from 'class-validator';
import { CustomerDto } from './customerDto';

export class FindCustomerParamDto {
  @IsUUID('4')
  public readonly id: string;
}

export class FindCustomerResponseData {
  public constructor(public readonly customer: CustomerDto) {}
}

export class FindCustomerResponseDto {
  public constructor(public readonly data: FindCustomerResponseData, public readonly statusCode: number) {}
}
