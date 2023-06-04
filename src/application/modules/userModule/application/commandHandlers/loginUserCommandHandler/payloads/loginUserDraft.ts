import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const loginUserDraftSchema = Schema.union([
  Schema.object({
    email: Schema.string(),
    password: Schema.string(),
  }),
  Schema.object({
    phoneNumber: Schema.string(),
    password: Schema.string(),
  }),
]);

export type LoginUserDraft = SchemaType<typeof loginUserDraftSchema>;
