import { createAuthorDraftSchema } from './createAuthorDraft';
import { UnitOfWork } from '../../../../../../../libs/unitOfWork/unitOfWork';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const createAuthorPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  draft: createAuthorDraftSchema,
});

export type CreateAuthorPayload = SchemaType<typeof createAuthorPayloadSchema>;
