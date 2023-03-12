import { UnitOfWork } from '../../../../../../libs/unitOfWork/contracts/unitOfWork';
import { Schema } from '../../../../../../libs/validator/implementations/schema';
import { SchemaType } from '../../../../../../libs/validator/schemaType';

export const findBookPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  bookId: Schema.notEmptyString(),
});

export type FindBookPayload = SchemaType<typeof findBookPayloadSchema>;
