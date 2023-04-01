import { Schema } from '../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../libs/validator/schemaType';

export const registerUserByEmailDraftSchema = Schema.object({
  email: Schema.notEmptyString(),
  password: Schema.notEmptyString(),
});

export type RegisterUserByEmailDraft = SchemaType<typeof registerUserByEmailDraftSchema>;
