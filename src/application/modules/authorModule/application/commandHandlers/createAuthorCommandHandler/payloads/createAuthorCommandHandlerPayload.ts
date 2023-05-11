import { createAuthorDraftSchema } from './createAuthorDraft';
import { UnitOfWork } from '../../../../../../../libs/unitOfWork/unitOfWork';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const createAuthorCommandHandlerPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  draft: createAuthorDraftSchema,
});

export type CreateAuthorCommandHandlerPayload = SchemaType<typeof createAuthorCommandHandlerPayloadSchema>;
