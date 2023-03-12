import { createReviewDraftSchema } from './createReviewDraft';
import { UnitOfWork } from '../../../../../../libs/unitOfWork/unitOfWork';

import { SchemaType } from '../../../../../../libs/validator/schemaType';
import { Schema } from '../../../../../../libs/validator/schema';

export const createReviewPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  draft: createReviewDraftSchema,
});

export type CreateReviewPayload = SchemaType<typeof createReviewPayloadSchema>;
