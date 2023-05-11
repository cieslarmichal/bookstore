import { UnitOfWork } from '../../../../../../../libs/unitOfWork/unitOfWork';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const deleteAuthorBookCommandHandlerPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  authorId: Schema.string(),
  bookId: Schema.string(),
});

export type DeleteAuthorBookCommandHandlerPayload = SchemaType<typeof deleteAuthorBookCommandHandlerPayloadSchema>;
