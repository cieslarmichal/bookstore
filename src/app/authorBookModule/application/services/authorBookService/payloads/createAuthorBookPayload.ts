import { createAuthorBookDraftSchema } from './createAuthorBookDraft';
import { UnitOfWork } from '../../../../../../libs/unitOfWork/contracts/unitOfWork';
import { Schema } from '../../../../../../libs/validator/implementations/schema';
import { SchemaType } from '../../../../../../libs/validator/schemaType';

export const createAuthorBookPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  draft: createAuthorBookDraftSchema,
});

export type CreateAuthorBookPayload = SchemaType<typeof createAuthorBookPayloadSchema>;
