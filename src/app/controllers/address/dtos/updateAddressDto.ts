import { IsOptional, IsString } from 'class-validator';
import { AddressDto } from './addressDto';

export class UpdateAddressBodyDto {
  @IsString()
  @IsOptional()
  public readonly firstName: string;

  @IsString()
  @IsOptional()
  public readonly lastName: string;

  @IsString()
  @IsOptional()
  public readonly phoneNumber?: string;

  @IsString()
  @IsOptional()
  public readonly country?: string;

  @IsString()
  @IsOptional()
  public readonly state?: string;

  @IsString()
  @IsOptional()
  public readonly city?: string;

  @IsString()
  @IsOptional()
  public readonly zipCode?: string;

  @IsString()
  @IsOptional()
  public readonly streetAddress?: string;

  @IsString()
  @IsOptional()
  public readonly deliveryInstructions?: string;
}

export class UpdateAddressResponseData {
  public constructor(public readonly address: AddressDto) {}
}

export class UpdateAddressResponseDto {
  public constructor(public readonly data: UpdateAddressResponseData, public readonly statusCode: number) {}
}
