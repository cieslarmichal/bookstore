import { createWhishlistEntryDraftSchema } from './createWhishlistEntryDraft';
import { UnitOfWork } from '../../../../../../libs/unitOfWork/unitOfWork';

import { SchemaType } from '../../../../../../libs/validator/schemaType';
import { Schema } from '../../../../../../libs/validator/schema';

export const createWhishlistEntryPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  draft: createWhishlistEntryDraftSchema,
});

export type CreateWhishlistEntryPayload = SchemaType<typeof createWhishlistEntryPayloadSchema>;
