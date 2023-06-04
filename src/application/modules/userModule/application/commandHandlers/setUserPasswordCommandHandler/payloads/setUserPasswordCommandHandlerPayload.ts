import { UnitOfWork } from '../../../../../../../libs/unitOfWork/unitOfWork';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const setUserPasswordCommandHandlerPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  userId: Schema.string(),
  password: Schema.string(),
});

export type SetUserPasswordCommandHandlerPayload = SchemaType<typeof setUserPasswordCommandHandlerPayloadSchema>;
