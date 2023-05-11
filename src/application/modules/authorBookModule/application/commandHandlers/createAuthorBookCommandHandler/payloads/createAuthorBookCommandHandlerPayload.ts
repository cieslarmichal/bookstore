import { createAuthorBookDraftSchema } from './createAuthorBookDraft';
import { UnitOfWork } from '../../../../../../../libs/unitOfWork/unitOfWork';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const createAuthorBookCommandHandlerPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  draft: createAuthorBookDraftSchema,
});

export type CreateAuthorBookCommandHandlerPayload = SchemaType<typeof createAuthorBookCommandHandlerPayloadSchema>;
