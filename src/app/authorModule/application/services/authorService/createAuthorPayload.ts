import { createAuthorDraftSchema } from './payloads/createAuthorDraft';
import { UnitOfWork } from '../../../../../libs/unitOfWork/contracts/unitOfWork';
import { SchemaType } from '../../../../../libs/validator/contracts/schemaType';
import { Schema } from '../../../../../libs/validator/implementations/schema';

export const createAuthorPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  draft: createAuthorDraftSchema,
});

export type CreateAuthorPayload = SchemaType<typeof createAuthorPayloadSchema>;
