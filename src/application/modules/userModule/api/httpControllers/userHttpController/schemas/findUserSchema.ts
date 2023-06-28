import { userSchema } from './userSchema';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const findUserPathParametersSchema = Schema.object({
  id: Schema.string(),
});

export type FindUserPathParameters = SchemaType<typeof findUserPathParametersSchema>;

export const findUserResponseOkBodySchema = Schema.object({
  user: userSchema,
});

export type FindUserResponseOkBody = SchemaType<typeof findUserResponseOkBodySchema>;
