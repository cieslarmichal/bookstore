import { reviewSchema } from './reviewSchema';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const findReviewPathParametersSchema = Schema.object({
  id: Schema.string(),
});

export type FindReviewPathParameters = SchemaType<typeof findReviewPathParametersSchema>;

export const findReviewResponseOkBodySchema = Schema.object({
  review: reviewSchema,
});

export type FindReviewResponseOkBody = SchemaType<typeof findReviewResponseOkBodySchema>;
