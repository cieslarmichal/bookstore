import { UnitOfWork } from '../../../../../libs/unitOfWork/contracts/unitOfWork';
import { SchemaType } from '../../../../../libs/validator/contracts/schemaType';
import { Schema } from '../../../../../libs/validator/implementations/schema';

export const deleteBookPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  bookId: Schema.notEmptyString(),
});

export type DeleteBookPayload = SchemaType<typeof deleteBookPayloadSchema>;
