import { SchemaType } from '../../../../../common/validator/contracts/schemaType';
import { Schema } from '../../../../../common/validator/implementations/schema';

export const registerUserByEmailDraftSchema = Schema.object({
  email: Schema.notEmptyString(),
  password: Schema.notEmptyString(),
});

export type RegisterUserByEmailDraft = SchemaType<typeof registerUserByEmailDraftSchema>;
