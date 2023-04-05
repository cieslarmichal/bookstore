import { Schema } from '../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../libs/validator/schemaType';
import { Validator } from '../../../../../../libs/validator/validator';

export const addressInputSchema = Schema.object({
  id: Schema.string(),
  firstName: Schema.string(),
  lastName: Schema.string(),
  phoneNumber: Schema.string(),
  country: Schema.string(),
  state: Schema.string(),
  city: Schema.string(),
  zipCode: Schema.string(),
  streetAddress: Schema.string(),
  customerId: Schema.string(),
  deliveryInstructions: Schema.string().optional(),
});

export type AddressInput = SchemaType<typeof addressInputSchema>;

export class Address {
  public readonly id: string;
  public readonly firstName: string;
  public readonly lastName: string;
  public readonly phoneNumber: string;
  public readonly country: string;
  public readonly state: string;
  public readonly city: string;
  public readonly zipCode: string;
  public readonly streetAddress: string;
  public readonly deliveryInstructions?: string;
  public readonly customerId: string;

  public constructor(input: AddressInput) {
    const {
      id,
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
    } = Validator.validate(addressInputSchema, input);

    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.phoneNumber = phoneNumber;
    this.country = country;
    this.state = state;
    this.city = city;
    this.zipCode = zipCode;
    this.streetAddress = streetAddress;
    this.customerId = customerId;

    if (deliveryInstructions) {
      this.deliveryInstructions = deliveryInstructions;
    }
  }
}
