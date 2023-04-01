import { registerUserByPhoneNumberDraftSchema } from './registerUserByPhoneNumberDraft';
import { UnitOfWork } from '../../../../../../../libs/unitOfWork/unitOfWork';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const registerUserByPhoneNumberPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  draft: registerUserByPhoneNumberDraftSchema,
});

export type RegisterUserByPhoneNumberPayload = SchemaType<typeof registerUserByPhoneNumberPayloadSchema>;
