import { addressSchema } from './addressSchema';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const createAddressBodySchema = Schema.object({
  firstName: Schema.notEmptyString(),
  lastName: Schema.notEmptyString(),
  phoneNumber: Schema.notEmptyString(),
  country: Schema.notEmptyString(),
  state: Schema.notEmptyString(),
  city: Schema.notEmptyString(),
  zipCode: Schema.notEmptyString(),
  streetAddress: Schema.notEmptyString(),
  customerId: Schema.notEmptyString(),
  deliveryInstructions: Schema.notEmptyString().optional(),
});

export type CreateAddressBody = SchemaType<typeof createAddressBodySchema>;

export const createAddressResponseCreatedBodySchema = Schema.object({
  address: addressSchema,
});

export type CreateAddressResponseCreatedBody = SchemaType<typeof createAddressResponseCreatedBodySchema>;
