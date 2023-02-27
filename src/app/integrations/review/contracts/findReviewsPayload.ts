import { PaginationData } from '../../../common/types/contracts/paginationData';
import { SchemaType } from '../../../common/validator/contracts/schemaType';
import { Schema } from '../../../common/validator/implementations/schema';

export const findReviewsPayloadSchema = Schema.object({
  pagination: Schema.unsafeType<PaginationData>(),
  customerId: Schema.notEmptyString(),
});

export type FindReviewsPayload = SchemaType<typeof findReviewsPayloadSchema>;
