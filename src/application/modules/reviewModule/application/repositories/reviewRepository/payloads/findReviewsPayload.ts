import { PaginationData } from '../../../../../../../common/types/paginationData';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const findReviewsPayloadSchema = Schema.object({
  pagination: Schema.unsafeType<PaginationData>(),
  customerId: Schema.string().optional(),
  isbn: Schema.string().optional(),
});

export type FindReviewsPayload = SchemaType<typeof findReviewsPayloadSchema>;
