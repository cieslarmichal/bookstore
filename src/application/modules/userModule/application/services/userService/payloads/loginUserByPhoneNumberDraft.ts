import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const loginUserByPhoneNumberDraftSchema = Schema.object({
  phoneNumber: Schema.string(),
  password: Schema.string(),
});

export type LoginUserByPhoneNumberDraft = SchemaType<typeof loginUserByPhoneNumberDraftSchema>;
