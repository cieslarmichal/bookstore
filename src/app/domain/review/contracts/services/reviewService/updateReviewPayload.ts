import { updateReviewDraftSchema } from './updateReviewDraft';
import { SchemaType } from '../../../../../common/validator/contracts/schemaType';
import { Schema } from '../../../../../common/validator/implementations/schema';
import { UnitOfWork } from '../../../../../libs/unitOfWork/contracts/unitOfWork';

export const updateReviewPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  reviewId: Schema.notEmptyString(),
  draft: updateReviewDraftSchema,
});

export type UpdateReviewPayload = SchemaType<typeof updateReviewPayloadSchema>;
