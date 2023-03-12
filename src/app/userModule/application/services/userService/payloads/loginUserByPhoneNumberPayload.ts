import { loginUserByPhoneNumberDraftSchema } from './loginUserByPhoneNumberDraft';
import { UnitOfWork } from '../../../../../../libs/unitOfWork/contracts/unitOfWork';
import { SchemaType } from '../../../../../../libs/validator/schemaType';
import { Schema } from '../../../../../../libs/validator/implementations/schema';

export const loginUserByPhoneNumberPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  draft: loginUserByPhoneNumberDraftSchema,
});

export type LoginUserByPhoneNumberPayload = SchemaType<typeof loginUserByPhoneNumberPayloadSchema>;
