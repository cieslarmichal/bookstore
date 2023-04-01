import { UnitOfWork } from '../../../../../../../libs/unitOfWork/unitOfWork';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const deleteBookPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  bookId: Schema.notEmptyString(),
});

export type DeleteBookPayload = SchemaType<typeof deleteBookPayloadSchema>;
