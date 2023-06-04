import { UnitOfWork } from '../../../../../../../libs/unitOfWork/unitOfWork';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const findUserQueryHandlerPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  userId: Schema.string(),
});

export type FindUserQueryHandlerPayload = SchemaType<typeof findUserQueryHandlerPayloadSchema>;
