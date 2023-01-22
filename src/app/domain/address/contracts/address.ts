import { IsDate, IsOptional, IsString, IsUuidV4 } from '../../../common/validator/decorators';
import { Validator } from '../../../common/validator/validator';

export class Address {
  @IsUuidV4()
  public readonly id: string;

  @IsDate()
  public readonly createdAt: Date;

  @IsDate()
  public readonly updatedAt: Date;

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

  @IsOptional()
  @IsString()
  public readonly deliveryInstructions?: string | undefined;

  @IsOptional()
  @IsUuidV4()
  public readonly customerId?: string | undefined;

  public constructor({
    id,
    createdAt,
    updatedAt,
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
  }: Address) {
    this.id = id;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
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
