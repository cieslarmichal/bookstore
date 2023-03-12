import { SchemaType } from '../../../../../../libs/validator/schemaType';
import { Schema } from '../../../../../../libs/validator/schema';

export const updateReviewDraftSchema = Schema.object({
  rate: Schema.positiveInteger().optional(),
  comment: Schema.notEmptyString().optional(),
});

export type UpdateReviewDraft = SchemaType<typeof updateReviewDraftSchema>;
