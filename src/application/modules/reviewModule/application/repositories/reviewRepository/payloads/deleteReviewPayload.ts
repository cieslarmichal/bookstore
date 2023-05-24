import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const deleteReviewPayloadSchema = Schema.object({
  id: Schema.string(),
});

export type DeleteReviewPayload = SchemaType<typeof deleteReviewPayloadSchema>;
