import { UnitOfWork } from '../../../../../libs/unitOfWork/contracts/unitOfWork';
import { SchemaType } from '../../../../../libs/validator/contracts/schemaType';
import { Schema } from '../../../../../libs/validator/implementations/schema';

export const deleteAuthorBookPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  authorId: Schema.notEmptyString(),
  bookId: Schema.notEmptyString(),
});

export type DeleteAuthorBookPayload = SchemaType<typeof deleteAuthorBookPayloadSchema>;
