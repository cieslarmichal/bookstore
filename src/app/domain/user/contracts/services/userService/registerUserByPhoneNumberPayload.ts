import { registerUserByPhoneNumberDraftSchema } from './registerUserByPhoneNumberDraft';
import { SchemaType } from '../../../../../common/validator/contracts/schemaType';
import { Schema } from '../../../../../common/validator/implementations/schema';
import { UnitOfWork } from '../../../../../libs/unitOfWork/contracts/unitOfWork';

export const registerUserByPhoneNumberPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  draft: registerUserByPhoneNumberDraftSchema,
});

export type RegisterUserByPhoneNumberPayload = SchemaType<typeof registerUserByPhoneNumberPayloadSchema>;
