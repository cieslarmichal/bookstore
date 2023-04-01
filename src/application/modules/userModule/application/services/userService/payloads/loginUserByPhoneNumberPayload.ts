import { loginUserByPhoneNumberDraftSchema } from './loginUserByPhoneNumberDraft';
import { UnitOfWork } from '../../../../../../../libs/unitOfWork/unitOfWork';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const loginUserByPhoneNumberPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  draft: loginUserByPhoneNumberDraftSchema,
});

export type LoginUserByPhoneNumberPayload = SchemaType<typeof loginUserByPhoneNumberPayloadSchema>;
