import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const createReviewPayloadSchema = Schema.object({
  id: Schema.string(),
  isbn: Schema.string(),
  rate: Schema.positiveInteger(),
  comment: Schema.string().optional(),
  customerId: Schema.string(),
});

export type CreateReviewPayload = SchemaType<typeof createReviewPayloadSchema>;
