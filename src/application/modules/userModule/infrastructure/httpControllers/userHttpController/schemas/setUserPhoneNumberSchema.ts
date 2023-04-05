import { userSchema } from './userSchema';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const setUserPhoneNumberBodySchema = Schema.object({
  phoneNumber: Schema.string(),
});

export type SetUserPhoneNumberBody = SchemaType<typeof setUserPhoneNumberBodySchema>;

export const setUserPhoneNumberResponseOkBodySchema = Schema.object({
  user: userSchema,
});

export type SetUserPhoneNumberResponseOkBody = SchemaType<typeof setUserPhoneNumberResponseOkBodySchema>;
