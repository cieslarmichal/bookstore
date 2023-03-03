import { SchemaType } from '../../../../../libs/validator/contracts/schemaType';
import { Schema } from '../../../../../libs/validator/implementations/schema';

export const updateReviewDraftSchema = Schema.object({
  rate: Schema.positiveInteger().optional(),
  comment: Schema.notEmptyString().optional(),
});

export type UpdateReviewDraft = SchemaType<typeof updateReviewDraftSchema>;
