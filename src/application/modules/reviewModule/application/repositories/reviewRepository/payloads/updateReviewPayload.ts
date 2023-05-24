import { updateReviewDraftSchema } from './updateReviewDraft';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const updateReviewPayloadSchema = Schema.object({
  id: Schema.string(),
  draft: updateReviewDraftSchema,
});

export type UpdateReviewPayload = SchemaType<typeof updateReviewPayloadSchema>;
