import { reviewSchema } from './reviewSchema';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const findReviewsQueryParametersSchema = Schema.object({
  page: Schema.string().optional(),
  limit: Schema.string().optional(),
  customerId: Schema.string().optional(),
  isbn: Schema.string().optional(),
});

export type FindReviewsQueryParameters = SchemaType<typeof findReviewsQueryParametersSchema>;

export const findReviewsResponseOkBodySchema = Schema.object({
  data: Schema.array(reviewSchema),
});

export type FindReviewsResponseOkBody = SchemaType<typeof findReviewsResponseOkBodySchema>;
