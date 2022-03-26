import { IsOptional, IsString } from 'class-validator';

export class UpdateAddressData {
  @IsString()
  @IsOptional()
  public readonly firstName?: string;

  @IsString()
  @IsOptional()
  public readonly lastName?: string;

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
