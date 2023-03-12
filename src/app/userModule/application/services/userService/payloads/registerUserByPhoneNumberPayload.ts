import { registerUserByPhoneNumberDraftSchema } from './registerUserByPhoneNumberDraft';
import { UnitOfWork } from '../../../../../../libs/unitOfWork/unitOfWork';

import { SchemaType } from '../../../../../../libs/validator/schemaType';
import { Schema } from '../../../../../../libs/validator/schema';

export const registerUserByPhoneNumberPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  draft: registerUserByPhoneNumberDraftSchema,
});

export type RegisterUserByPhoneNumberPayload = SchemaType<typeof registerUserByPhoneNumberPayloadSchema>;
