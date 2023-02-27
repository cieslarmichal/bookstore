import { createReviewDraftSchema } from './createReviewDraft';
import { SchemaType } from '../../../../../common/validator/contracts/schemaType';
import { Schema } from '../../../../../common/validator/implementations/schema';
import { UnitOfWork } from '../../../../../libs/unitOfWork/contracts/unitOfWork';

export const createReviewPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  draft: createReviewDraftSchema,
});

export type CreateReviewPayload = SchemaType<typeof createReviewPayloadSchema>;
