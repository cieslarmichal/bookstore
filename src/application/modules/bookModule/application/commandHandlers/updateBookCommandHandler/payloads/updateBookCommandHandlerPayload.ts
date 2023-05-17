import { updateBookDraftSchema } from './updateBookDraft';
import { UnitOfWork } from '../../../../../../../libs/unitOfWork/unitOfWork';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const updateBookCommandHandlerPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  bookId: Schema.string(),
  draft: updateBookDraftSchema,
});

export type UpdateBookCommandHandlerPayload = SchemaType<typeof updateBookCommandHandlerPayloadSchema>;
