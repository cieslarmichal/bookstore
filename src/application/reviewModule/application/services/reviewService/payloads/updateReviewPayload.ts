import { updateReviewDraftSchema } from './updateReviewDraft';
import { UnitOfWork } from '../../../../../../libs/unitOfWork/unitOfWork';
import { Schema } from '../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../libs/validator/schemaType';

export const updateReviewPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  reviewId: Schema.notEmptyString(),
  draft: updateReviewDraftSchema,
});

export type UpdateReviewPayload = SchemaType<typeof updateReviewPayloadSchema>;
