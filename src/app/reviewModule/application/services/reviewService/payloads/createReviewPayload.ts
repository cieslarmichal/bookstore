import { createReviewDraftSchema } from './createReviewDraft';
import { UnitOfWork } from '../../../../../../libs/unitOfWork/contracts/unitOfWork';
import { SchemaType } from '../../../../../../libs/validator/contracts/schemaType';
import { Schema } from '../../../../../../libs/validator/implementations/schema';

export const createReviewPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  draft: createReviewDraftSchema,
});

export type CreateReviewPayload = SchemaType<typeof createReviewPayloadSchema>;
