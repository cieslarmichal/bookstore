import { userSchema } from './userSchema';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const setUserPasswordBodySchema = Schema.object({
  password: Schema.string(),
});

export type SetUserPasswordBody = SchemaType<typeof setUserPasswordBodySchema>;

export const setUserPasswordResponseOkBodySchema = Schema.object({
  user: userSchema,
});

export type SetUserPasswordResponseOkBody = SchemaType<typeof setUserPasswordResponseOkBodySchema>;
