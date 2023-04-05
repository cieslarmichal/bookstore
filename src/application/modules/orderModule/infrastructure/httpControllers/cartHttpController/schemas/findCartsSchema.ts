import { cartSchema } from './cartSchema';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const findCartsQueryParametersSchema = Schema.object({
  page: Schema.number().optional(),
  limit: Schema.number().optional(),
  customerId: Schema.notEmptyString(),
});

export type FindCartsQueryParameters = SchemaType<typeof findCartsQueryParametersSchema>;

export const findCartsResponseOkBodySchema = Schema.object({
  data: Schema.array(cartSchema),
});

export type FindCartsResponseOkBody = SchemaType<typeof findCartsResponseOkBodySchema>;
