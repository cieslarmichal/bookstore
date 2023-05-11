import { userSchema } from './userSchema';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const findUserResponseOkBodySchema = Schema.object({
  user: userSchema,
});

export type FindUserResponseOkBody = SchemaType<typeof findUserResponseOkBodySchema>;
