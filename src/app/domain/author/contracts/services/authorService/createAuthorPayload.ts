import { createAuthorDraftSchema } from './createAuthorDraft';
import { SchemaType } from '../../../../../common/validator/contracts/schemaType';
import { Schema } from '../../../../../common/validator/implementations/schema';
import { UnitOfWork } from '../../../../../libs/unitOfWork/contracts/unitOfWork';

export const createAuthorPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  draft: createAuthorDraftSchema,
});

export type CreateAuthorPayload = SchemaType<typeof createAuthorPayloadSchema>;
