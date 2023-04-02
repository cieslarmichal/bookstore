import { addressSchema } from './addressSchema';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const updateAddressPathParametersSchema = Schema.object({
  id: Schema.string(),
});

export type UpdateAddressPathParameters = SchemaType<typeof updateAddressPathParametersSchema>;

export const updateAddressBodySchema = Schema.object({
  firstName: Schema.notEmptyString().optional(),
  lastName: Schema.notEmptyString().optional(),
  phoneNumber: Schema.notEmptyString().optional(),
  country: Schema.notEmptyString().optional(),
  state: Schema.notEmptyString().optional(),
  city: Schema.notEmptyString().optional(),
  zipCode: Schema.notEmptyString().optional(),
  streetAddress: Schema.notEmptyString().optional(),
  deliveryInstructions: Schema.notEmptyString().optional(),
});

export type UpdateAddressBody = SchemaType<typeof updateAddressBodySchema>;

export const updateAddressResponseOkBodySchema = Schema.object({
  address: addressSchema,
});

export type UpdateAddressResponseOkBody = SchemaType<typeof updateAddressResponseOkBodySchema>;
