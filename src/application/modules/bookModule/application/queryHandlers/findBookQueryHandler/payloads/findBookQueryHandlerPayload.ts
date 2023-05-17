import { UnitOfWork } from '../../../../../../../libs/unitOfWork/unitOfWork';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const findBookQueryHandlerPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  bookId: Schema.string(),
});

export type FindBookQueryHandlerPayload = SchemaType<typeof findBookQueryHandlerPayloadSchema>;
