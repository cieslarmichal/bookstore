import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';
import { Review } from '../../../../domain/entities/review/review';

export const findReviewQueryHandlerResultSchema = Schema.object({
  review: Schema.instanceof(Review),
});

export type FindReviewQueryHandlerResult = SchemaType<typeof findReviewQueryHandlerResultSchema>;
