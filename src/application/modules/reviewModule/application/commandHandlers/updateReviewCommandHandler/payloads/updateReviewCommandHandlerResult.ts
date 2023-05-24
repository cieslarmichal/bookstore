import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';
import { Review } from '../../../../domain/entities/review/review';

export const updateReviewCommandHandlerResultSchema = Schema.object({
  review: Schema.instanceof(Review),
});

export type UpdateReviewCommandHandlerResult = SchemaType<typeof updateReviewCommandHandlerResultSchema>;
