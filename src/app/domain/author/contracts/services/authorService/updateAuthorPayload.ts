import { updateAuthorDraftSchema } from './updateAuthorDraft';
import { SchemaType } from '../../../../../common/validator/contracts/schemaType';
import { Schema } from '../../../../../common/validator/implementations/schema';
import { UnitOfWork } from '../../../../../libs/unitOfWork/contracts/unitOfWork';

export const updateAuthorPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  authorId: Schema.notEmptyString(),
  draft: updateAuthorDraftSchema,
});

export type UpdateAuthorPayload = SchemaType<typeof updateAuthorPayloadSchema>;