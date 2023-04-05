import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const loginUserByEmailDraftSchema = Schema.object({
  email: Schema.string(),
  password: Schema.string(),
});

export type LoginUserByEmailDraft = SchemaType<typeof loginUserByEmailDraftSchema>;
