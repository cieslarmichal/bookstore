import { IsUUID } from 'class-validator';
import { AddressDto } from './addressDto';

export class FindAddressParamDto {
  @IsUUID('4')
  public readonly id: string;
}

export class FindAddressResponseData {
  public constructor(public readonly address: AddressDto) {}
}

export class FindAddressResponseDto {
  public constructor(public readonly data: FindAddressResponseData, public readonly statusCode: number) {}
}
