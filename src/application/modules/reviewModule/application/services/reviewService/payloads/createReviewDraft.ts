import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const createReviewDraftSchema = Schema.object({
  isbn: Schema.notEmptyString(),
  rate: Schema.positiveInteger(),
  comment: Schema.notEmptyString().optional(),
  customerId: Schema.notEmptyString(),
});

export type CreateReviewDraft = SchemaType<typeof createReviewDraftSchema>;
