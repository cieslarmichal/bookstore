import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';
import { Review } from '../../../../domain/entities/review/review';

export const createReviewCommandHandlerResultSchema = Schema.object({
  review: Schema.instanceof(Review),
});

export type CreateReviewCommandHandlerResult = SchemaType<typeof createReviewCommandHandlerResultSchema>;
