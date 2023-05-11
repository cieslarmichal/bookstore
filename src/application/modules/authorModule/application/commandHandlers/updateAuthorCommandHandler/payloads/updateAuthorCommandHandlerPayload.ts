import { updateAuthorDraftSchema } from './updateAuthorDraft';
import { UnitOfWork } from '../../../../../../../libs/unitOfWork/unitOfWork';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const updateAuthorCommandHandlerPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  authorId: Schema.string(),
  draft: updateAuthorDraftSchema,
});

export type UpdateAuthorCommandHandlerPayload = SchemaType<typeof updateAuthorCommandHandlerPayloadSchema>;
