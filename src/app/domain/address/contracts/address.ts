import { SchemaType } from '../../../common/validator/contracts/schemaType';
import { PayloadFactory } from '../../../common/validator/implementations/payloadFactory';
import { Schema } from '../../../common/validator/implementations/schema';

export const addressInputSchema = Schema.object({
  id: Schema.notEmptyString(),
  firstName: Schema.notEmptyString(),
  lastName: Schema.notEmptyString(),
  phoneNumber: Schema.notEmptyString(),
  country: Schema.notEmptyString(),
  state: Schema.notEmptyString(),
  city: Schema.notEmptyString(),
  zipCode: Schema.notEmptyString(),
  streetAddress: Schema.notEmptyString(),
  deliveryInstructions: Schema.notEmptyString().optional(),
  customerId: Schema.notEmptyString().optional(),
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
  public readonly customerId?: string;

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
    } = PayloadFactory.create(addressInputSchema, input);

    this.id = id;
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
  }
}
