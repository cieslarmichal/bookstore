import { IsOptional, IsString } from 'class-validator';
import { AddressDto } from './addressDto';

export class CreateAddressBodyDto {
  @IsString()
  public readonly fullName: string;

  @IsString()
  public readonly phoneNumber: string;

  @IsString()
  public readonly country: string;

  @IsString()
  public readonly state: string;

  @IsString()
  public readonly city: string;

  @IsString()
  public readonly zipCode: string;

  @IsString()
  public readonly streetAddress: string;

  @IsString()
  @IsOptional()
  public readonly deliveryInstructions?: string;
}

export class CreateAddressResponseData {
  public constructor(public readonly address: AddressDto) {}
}

export class CreateAddressResponseDto {
  public constructor(public readonly data: CreateAddressResponseData, public readonly statusCode: number) {}
}
