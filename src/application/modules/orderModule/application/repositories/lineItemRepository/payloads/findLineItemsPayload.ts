import { PaginationData } from '../../../../../../../common/types/paginationData';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const findLineItemsPayloadSchema = Schema.object({
  pagination: Schema.unsafeType<PaginationData>(),
  cartId: Schema.string(),
});

export type FindLineItemsPayload = SchemaType<typeof findLineItemsPayloadSchema>;
