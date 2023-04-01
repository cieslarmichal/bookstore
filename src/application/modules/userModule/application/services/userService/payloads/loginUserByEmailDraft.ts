import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const loginUserByEmailDraftSchema = Schema.object({
  email: Schema.notEmptyString(),
  password: Schema.notEmptyString(),
});

export type LoginUserByEmailDraft = SchemaType<typeof loginUserByEmailDraftSchema>;
