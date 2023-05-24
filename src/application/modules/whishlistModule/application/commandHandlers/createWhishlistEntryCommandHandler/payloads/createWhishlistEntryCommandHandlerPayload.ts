import { createWhishlistEntryDraftSchema } from './createWhishlistEntryDraft';
import { UnitOfWork } from '../../../../../../../libs/unitOfWork/unitOfWork';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const createWhishlistEntryCommandHandlerPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  draft: createWhishlistEntryDraftSchema,
});

export type CreateWhishlistEntryCommandHandlerPayload = SchemaType<
  typeof createWhishlistEntryCommandHandlerPayloadSchema
>;
