import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const registerUserByEmailDraftSchema = Schema.object({
  email: Schema.string(),
  password: Schema.string(),
});

export type RegisterUserByEmailDraft = SchemaType<typeof registerUserByEmailDraftSchema>;
