import { createReviewDraftSchema } from './createReviewDraft';
import { UnitOfWork } from '../../../../../../../libs/unitOfWork/unitOfWork';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const createReviewCommandHandlerPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  draft: createReviewDraftSchema,
});

export type CreateReviewCommandHandlerPayload = SchemaType<typeof createReviewCommandHandlerPayloadSchema>;
