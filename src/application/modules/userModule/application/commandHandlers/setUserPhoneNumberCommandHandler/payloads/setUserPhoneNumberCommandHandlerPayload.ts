import { UnitOfWork } from '../../../../../../../libs/unitOfWork/unitOfWork';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const setUserPhoneNumberCommandHandlerPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  userId: Schema.string(),
  phoneNumber: Schema.string(),
});

export type SetUserPhoneNumberCommandHandlerPayload = SchemaType<typeof setUserPhoneNumberCommandHandlerPayloadSchema>;
