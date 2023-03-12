import { createReviewDraftSchema } from './createReviewDraft';
import { UnitOfWork } from '../../../../../../libs/unitOfWork/unitOfWork';
import { Schema } from '../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../libs/validator/schemaType';

export const createReviewPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  draft: createReviewDraftSchema,
});

export type CreateReviewPayload = SchemaType<typeof createReviewPayloadSchema>;
