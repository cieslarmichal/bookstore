import { addressSchema } from './addressSchema';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const findAddressPathParametersSchema = Schema.object({
  id: Schema.string(),
});

export type FindAddressPathParameters = SchemaType<typeof findAddressPathParametersSchema>;

export const findAddressResponseOkBodySchema = Schema.object({
  address: addressSchema,
});

export type FindAddressResponseOkBody = SchemaType<typeof findAddressResponseOkBodySchema>;
