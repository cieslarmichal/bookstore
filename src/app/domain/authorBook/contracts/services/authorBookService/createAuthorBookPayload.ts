import { createAuthorBookDraftSchema } from './createAuthorBookDraft';
import { SchemaType } from '../../../../../common/validator/contracts/schemaType';
import { Schema } from '../../../../../common/validator/implementations/schema';
import { UnitOfWork } from '../../../../../libs/unitOfWork/contracts/unitOfWork';

export const createAuthorBookPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  draft: createAuthorBookDraftSchema,
});

export type CreateAuthorBookPayload = SchemaType<typeof createAuthorBookPayloadSchema>;
