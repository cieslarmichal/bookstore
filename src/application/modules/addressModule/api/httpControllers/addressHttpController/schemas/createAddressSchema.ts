import { addressSchema } from './addressSchema';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const createAddressBodySchema = Schema.object({
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

export type CreateAddressBody = SchemaType<typeof createAddressBodySchema>;

export const createAddressResponseCreatedBodySchema = Schema.object({
  address: addressSchema,
});

export type CreateAddressResponseCreatedBody = SchemaType<typeof createAddressResponseCreatedBodySchema>;
