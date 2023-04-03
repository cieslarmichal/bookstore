import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const deleteReviewPathParametersSchema = Schema.object({
  id: Schema.string(),
});

export type DeleteReviewPathParameters = SchemaType<typeof deleteReviewPathParametersSchema>;

export const deleteReviewResponseNoContentBodySchema = Schema.null();

export type DeleteReviewResponseNoContentBody = SchemaType<typeof deleteReviewResponseNoContentBodySchema>;
