import { addressSchema } from './addressSchema';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const findAddressesQueryParametersSchema = Schema.object({
  page: Schema.number().optional(),
  limit: Schema.number().optional(),
  filter: Schema.unknown().optional(),
});

export type FindAddressesQueryParameters = SchemaType<typeof findAddressesQueryParametersSchema>;

export const findAddressesResponseOkBodySchema = Schema.object({
  data: Schema.array(addressSchema),
});

export type FindAddressesResponseOkBody = SchemaType<typeof findAddressesResponseOkBodySchema>;
