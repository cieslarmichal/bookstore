import { reviewSchema } from './reviewSchema';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const createReviewBodySchema = Schema.object({
  isbn: Schema.string(),
  rate: Schema.positiveInteger(),
  comment: Schema.string().optional(),
});

export type CreateReviewBody = SchemaType<typeof createReviewBodySchema>;

export const createReviewResponseCreatedBodySchema = Schema.object({
  review: reviewSchema,
});

export type CreateReviewResponseCreatedBody = SchemaType<typeof createReviewResponseCreatedBodySchema>;
