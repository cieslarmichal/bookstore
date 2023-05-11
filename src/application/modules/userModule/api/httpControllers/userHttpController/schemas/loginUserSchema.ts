import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const loginUserBodySchema = Schema.union([
  Schema.object({
    email: Schema.string(),
    password: Schema.string(),
  }),
  Schema.object({
    phoneNumber: Schema.string(),
    password: Schema.string(),
  }),
]);

export type LoginUserBody = SchemaType<typeof loginUserBodySchema>;

export const loginUserResponseOkBodySchema = Schema.object({
  token: Schema.string(),
});

export type LoginUserResponseOkBody = SchemaType<typeof loginUserResponseOkBodySchema>;
