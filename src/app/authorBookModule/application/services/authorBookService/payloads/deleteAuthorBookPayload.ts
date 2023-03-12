import { UnitOfWork } from '../../../../../../libs/unitOfWork/contracts/unitOfWork';
import { Schema } from '../../../../../../libs/validator/implementations/schema';
import { SchemaType } from '../../../../../../libs/validator/schemaType';

export const deleteAuthorBookPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  authorId: Schema.notEmptyString(),
  bookId: Schema.notEmptyString(),
});

export type DeleteAuthorBookPayload = SchemaType<typeof deleteAuthorBookPayloadSchema>;
