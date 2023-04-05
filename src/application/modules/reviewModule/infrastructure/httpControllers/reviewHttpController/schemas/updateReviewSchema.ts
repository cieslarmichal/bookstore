import { reviewSchema } from './reviewSchema';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const updateReviewPathParametersSchema = Schema.object({
  id: Schema.string(),
});

export type UpdateReviewPathParameters = SchemaType<typeof updateReviewPathParametersSchema>;

export const updateReviewBodySchema = Schema.object({
  rate: Schema.positiveInteger().optional(),
  comment: Schema.string().optional(),
});

export type UpdateReviewBody = SchemaType<typeof updateReviewBodySchema>;

export const updateReviewResponseOkBodySchema = Schema.object({
  review: reviewSchema,
});

export type UpdateReviewResponseOkBody = SchemaType<typeof updateReviewResponseOkBodySchema>;
