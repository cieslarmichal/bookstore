import { SchemaType } from '../../../../../../libs/validator/contracts/schemaType';
import { Schema } from '../../../../../../libs/validator/implementations/schema';

export const registerUserByPhoneNumberDraftSchema = Schema.object({
  phoneNumber: Schema.notEmptyString(),
  password: Schema.notEmptyString(),
});

export type RegisterUserByPhoneNumberDraft = SchemaType<typeof registerUserByPhoneNumberDraftSchema>;
