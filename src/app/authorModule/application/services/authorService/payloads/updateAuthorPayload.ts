import { updateAuthorDraftSchema } from './updateAuthorDraft';
import { UnitOfWork } from '../../../../../../libs/unitOfWork/contracts/unitOfWork';
import { SchemaType } from '../../../../../../libs/validator/contracts/schemaType';
import { Schema } from '../../../../../../libs/validator/implementations/schema';

export const updateAuthorPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  authorId: Schema.notEmptyString(),
  draft: updateAuthorDraftSchema,
});

export type UpdateAuthorPayload = SchemaType<typeof updateAuthorPayloadSchema>;
