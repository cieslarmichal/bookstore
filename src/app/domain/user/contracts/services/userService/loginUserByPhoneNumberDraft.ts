import { SchemaType } from '../../../../../common/validator/contracts/schemaType';
import { Schema } from '../../../../../common/validator/implementations/schema';

export const loginUserByPhoneNumberDraftSchema = Schema.object({
  phoneNumber: Schema.notEmptyString(),
  password: Schema.notEmptyString(),
});

export type LoginUserByPhoneNumberDraft = SchemaType<typeof loginUserByPhoneNumberDraftSchema>;
