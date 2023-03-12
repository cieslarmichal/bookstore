import { registerUserByPhoneNumberDraftSchema } from './registerUserByPhoneNumberDraft';
import { UnitOfWork } from '../../../../../../libs/unitOfWork/contracts/unitOfWork';
import { SchemaType } from '../../../../../../libs/validator/schemaType';
import { Schema } from '../../../../../../libs/validator/implementations/schema';

export const registerUserByPhoneNumberPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  draft: registerUserByPhoneNumberDraftSchema,
});

export type RegisterUserByPhoneNumberPayload = SchemaType<typeof registerUserByPhoneNumberPayloadSchema>;
