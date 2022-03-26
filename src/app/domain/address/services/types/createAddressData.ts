import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateAddressData {
  @IsString()
  public readonly firstName: string;

  @IsString()
  public readonly lastName: string;

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
  public readonly deliveryInstructions?: string | null;

  @IsOptional()
  @IsUUID('4')
  public readonly customerId: string;
}
