import { createAuthorBookDraftSchema } from './createAuthorBookDraft';
import { UnitOfWork } from '../../../../../../libs/unitOfWork/unitOfWork';

import { Schema } from '../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../libs/validator/schemaType';

export const createAuthorBookPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  draft: createAuthorBookDraftSchema,
});

export type CreateAuthorBookPayload = SchemaType<typeof createAuthorBookPayloadSchema>;
