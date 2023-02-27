import { SchemaType } from '../../../../../common/validator/contracts/schemaType';
import { Schema } from '../../../../../common/validator/implementations/schema';

export const createReviewDraftSchema = Schema.object({
  isbn: Schema.notEmptyString(),
  rate: Schema.positiveInteger(),
  comment: Schema.notEmptyString().optional(),
  customerId: Schema.notEmptyString(),
});

export type CreateReviewDraft = SchemaType<typeof createReviewDraftSchema>;
