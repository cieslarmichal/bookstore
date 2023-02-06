import { SchemaType } from '../../../../../common/validator/contracts/schemaType';
import { Schema } from '../../../../../common/validator/implementations/schema';
import { UnitOfWork } from '../../../../../libs/unitOfWork/contracts/unitOfWork';

export const setUserPhoneNumberPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  userId: Schema.notEmptyString(),
  phoneNumber: Schema.notEmptyString(),
});

export type SetUserPhoneNumberPayload = SchemaType<typeof setUserPhoneNumberPayloadSchema>;
