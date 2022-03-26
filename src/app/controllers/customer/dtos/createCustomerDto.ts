import { IsUUID } from 'class-validator';
import { CustomerDto } from './customerDto';

export class CreateCustomerBodyDto {
  @IsUUID('4')
  public readonly userId: string;
}

export class CreateCustomerResponseData {
  public constructor(public readonly customer: CustomerDto) {}
}

export class CreateCustomerResponseDto {
  public constructor(public readonly data: CreateCustomerResponseData, public readonly statusCode: number) {}
}
