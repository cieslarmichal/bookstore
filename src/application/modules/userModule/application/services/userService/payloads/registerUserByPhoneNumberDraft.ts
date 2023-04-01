import { Schema } from '../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../libs/validator/schemaType';

export const registerUserByPhoneNumberDraftSchema = Schema.object({
  phoneNumber: Schema.notEmptyString(),
  password: Schema.notEmptyString(),
});

export type RegisterUserByPhoneNumberDraft = SchemaType<typeof registerUserByPhoneNumberDraftSchema>;
