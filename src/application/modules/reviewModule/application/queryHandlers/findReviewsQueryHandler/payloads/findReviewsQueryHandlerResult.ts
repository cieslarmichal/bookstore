import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';
import { Review } from '../../../../domain/entities/review/review';

export const findReviewsQueryHandlerResultSchema = Schema.object({
  reviews: Schema.array(Schema.instanceof(Review)),
});

export type FindReviewsQueryHandlerResult = SchemaType<typeof findReviewsQueryHandlerResultSchema>;
