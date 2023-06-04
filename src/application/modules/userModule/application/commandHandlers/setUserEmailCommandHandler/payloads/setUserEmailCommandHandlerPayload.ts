import { UnitOfWork } from '../../../../../../../libs/unitOfWork/unitOfWork';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const setUserEmailCommandHandlerPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  userId: Schema.string(),
  email: Schema.string(),
});

export type SetUserEmailCommandHandlerPayload = SchemaType<typeof setUserEmailCommandHandlerPayloadSchema>;
