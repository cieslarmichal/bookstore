import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const createReviewDraftSchema = Schema.object({
  isbn: Schema.string(),
  rate: Schema.positiveInteger(),
  comment: Schema.string().optional(),
  customerId: Schema.string(),
});

export type CreateReviewDraft = SchemaType<typeof createReviewDraftSchema>;
