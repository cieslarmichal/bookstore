import { userSchema } from './userSchema';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const setUserEmailBodySchema = Schema.object({
  email: Schema.string(),
});

export type SetUserEmailBody = SchemaType<typeof setUserEmailBodySchema>;

export const setUserEmailResponseOkBodySchema = Schema.object({
  user: userSchema,
});

export type SetUserEmailResponseOkBody = SchemaType<typeof setUserEmailResponseOkBodySchema>;
