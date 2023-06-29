import { orderSchema } from './orderSchema';
import { Schema } from '../../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../../libs/validator/schemaType';

export const findOrdersQueryParametersSchema = Schema.object({
  page: Schema.string().optional(),
  limit: Schema.string().optional(),
});

export type FindOrdersQueryParameters = SchemaType<typeof findOrdersQueryParametersSchema>;

export const findOrdersResponseOkBodySchema = Schema.object({
  data: Schema.array(orderSchema),
});

export type FindOrdersResponseOkBody = SchemaType<typeof findOrdersResponseOkBodySchema>;
