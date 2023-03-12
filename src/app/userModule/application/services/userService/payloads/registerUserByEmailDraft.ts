import { SchemaType } from '../../../../../../libs/validator/schemaType';
import { Schema } from '../../../../../../libs/validator/implementations/schema';

export const registerUserByEmailDraftSchema = Schema.object({
  email: Schema.notEmptyString(),
  password: Schema.notEmptyString(),
});

export type RegisterUserByEmailDraft = SchemaType<typeof registerUserByEmailDraftSchema>;
