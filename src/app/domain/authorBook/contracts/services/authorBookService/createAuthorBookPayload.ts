import { createAuthorBookDraftSchema } from './createAuthorBookDraft';
import { UnitOfWork } from '../../../../../libs/unitOfWork/contracts/unitOfWork';
import { SchemaType } from '../../../../../libs/validator/contracts/schemaType';
import { Schema } from '../../../../../libs/validator/implementations/schema';

export const createAuthorBookPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  draft: createAuthorBookDraftSchema,
});

export type CreateAuthorBookPayload = SchemaType<typeof createAuthorBookPayloadSchema>;
