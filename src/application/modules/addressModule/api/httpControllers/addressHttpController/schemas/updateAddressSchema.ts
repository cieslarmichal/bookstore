import { addressSchema } from './addressSchema';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const updateAddressPathParametersSchema = Schema.object({
  id: Schema.string(),
});

export type UpdateAddressPathParameters = SchemaType<typeof updateAddressPathParametersSchema>;

export const updateAddressBodySchema = Schema.object({
  firstName: Schema.string().optional(),
  lastName: Schema.string().optional(),
  phoneNumber: Schema.string().optional(),
  country: Schema.string().optional(),
  state: Schema.string().optional(),
  city: Schema.string().optional(),
  zipCode: Schema.string().optional(),
  streetAddress: Schema.string().optional(),
  deliveryInstructions: Schema.string().optional(),
});

export type UpdateAddressBody = SchemaType<typeof updateAddressBodySchema>;

export const updateAddressResponseOkBodySchema = Schema.object({
  address: addressSchema,
});

export type UpdateAddressResponseOkBody = SchemaType<typeof updateAddressResponseOkBodySchema>;
