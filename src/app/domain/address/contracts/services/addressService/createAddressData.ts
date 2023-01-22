import { IsOptional, IsString, IsUUID } from 'class-validator';

import { Validator } from '../../../../../common/validator/validator';

export interface CreateAddressDataInput {
  readonly firstName: string;
  readonly lastName: string;
  readonly phoneNumber: string;
  readonly country: string;
  readonly state: string;
  readonly city: string;
  readonly zipCode: string;
  readonly streetAddress: string;
  readonly deliveryInstructions?: string | undefined;
  readonly customerId?: string | undefined;
}

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
  public readonly deliveryInstructions?: string;

  @IsOptional()
  @IsUUID('4')
  public readonly customerId?: string;

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
    customerId,
  }: CreateAddressDataInput) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.phoneNumber = phoneNumber;
    this.country = country;
    this.state = state;
    this.city = city;
    this.zipCode = zipCode;
    this.streetAddress = streetAddress;

    if (deliveryInstructions) {
      this.deliveryInstructions = deliveryInstructions;
    }

    if (customerId) {
      this.customerId = customerId;
    }

    Validator.validate(this);
  }
}
