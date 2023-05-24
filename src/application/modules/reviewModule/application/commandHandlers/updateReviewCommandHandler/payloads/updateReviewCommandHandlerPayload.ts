import { updateReviewDraftSchema } from './updateReviewDraft';
import { UnitOfWork } from '../../../../../../../libs/unitOfWork/unitOfWork';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const updateReviewCommandHandlerPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  reviewId: Schema.string(),
  draft: updateReviewDraftSchema,
});

export type UpdateReviewCommandHandlerPayload = SchemaType<typeof updateReviewCommandHandlerPayloadSchema>;
