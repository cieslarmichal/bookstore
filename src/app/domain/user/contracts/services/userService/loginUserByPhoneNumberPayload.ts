import { loginUserByPhoneNumberDraftSchema } from './loginUserByPhoneNumberDraft';
import { SchemaType } from '../../../../../common/validator/contracts/schemaType';
import { Schema } from '../../../../../common/validator/implementations/schema';
import { UnitOfWork } from '../../../../../libs/unitOfWork/contracts/unitOfWork';

export const loginUserByPhoneNumberPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  draft: loginUserByPhoneNumberDraftSchema,
});

export type LoginUserByPhoneNumberPayload = SchemaType<typeof loginUserByPhoneNumberPayloadSchema>;
