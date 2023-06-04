import { cartSchema } from './cartSchema';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const findCartsQueryParametersSchema = Schema.object({
  page: Schema.string().optional(),
  limit: Schema.string().optional(),
  customerId: Schema.string(),
});

export type FindCartsQueryParameters = SchemaType<typeof findCartsQueryParametersSchema>;

export const findCartsResponseOkBodySchema = Schema.object({
  data: Schema.array(cartSchema),
});

export type FindCartsResponseOkBody = SchemaType<typeof findCartsResponseOkBodySchema>;
