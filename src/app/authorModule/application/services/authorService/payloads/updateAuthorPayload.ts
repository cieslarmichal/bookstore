import { updateAuthorDraftSchema } from './updateAuthorDraft';
import { UnitOfWork } from '../../../../../../libs/unitOfWork/contracts/unitOfWork';
import { Schema } from '../../../../../../libs/validator/implementations/schema';
import { SchemaType } from '../../../../../../libs/validator/schemaType';

export const updateAuthorPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  authorId: Schema.notEmptyString(),
  draft: updateAuthorDraftSchema,
});

export type UpdateAuthorPayload = SchemaType<typeof updateAuthorPayloadSchema>;
