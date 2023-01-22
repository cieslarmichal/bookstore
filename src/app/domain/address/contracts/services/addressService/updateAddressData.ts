import { IsOptional, IsString } from 'class-validator';

import { Validator } from '../../../../../common/validator/validator';

export class UpdateAddressData {
  @IsString()
  @IsOptional()
  public readonly firstName?: string | undefined;

  @IsString()
  @IsOptional()
  public readonly lastName?: string | undefined;

  @IsString()
  @IsOptional()
  public readonly phoneNumber?: string | undefined;

  @IsString()
  @IsOptional()
  public readonly country?: string | undefined;

  @IsString()
  @IsOptional()
  public readonly state?: string | undefined;

  @IsString()
  @IsOptional()
  public readonly city?: string | undefined;

  @IsString()
  @IsOptional()
  public readonly zipCode?: string | undefined;

  @IsString()
  @IsOptional()
  public readonly streetAddress?: string | undefined;

  @IsString()
  @IsOptional()
  public readonly deliveryInstructions?: string | undefined;

  public constructor({
    firstName,
    lastName,
    phoneNumber,
    country,
    state,
    city,
    zipCode,
    streetAddress,
    deliveryInstructions,
  }: UpdateAddressData) {
    if (firstName) {
      this.firstName = firstName;
    }

    if (lastName) {
      this.lastName = lastName;
    }

    if (phoneNumber) {
      this.phoneNumber = phoneNumber;
    }

    if (country) {
      this.country = country;
    }

    if (state) {
      this.state = state;
    }

    if (city) {
      this.city = city;
    }

    if (zipCode) {
      this.zipCode = zipCode;
    }

    if (streetAddress) {
      this.streetAddress = streetAddress;
    }

    if (deliveryInstructions) {
      this.deliveryInstructions = deliveryInstructions;
    }

    Validator.validate(this);
  }
}
