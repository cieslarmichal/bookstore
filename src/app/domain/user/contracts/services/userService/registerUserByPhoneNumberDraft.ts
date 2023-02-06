import { SchemaType } from '../../../../../common/validator/contracts/schemaType';
import { Schema } from '../../../../../common/validator/implementations/schema';

export const registerUserByPhoneNumberDraftSchema = Schema.object({
  phoneNumber: Schema.notEmptyString(),
  password: Schema.notEmptyString(),
});

export type RegisterUserByPhoneNumberDraft = SchemaType<typeof registerUserByPhoneNumberDraftSchema>;
