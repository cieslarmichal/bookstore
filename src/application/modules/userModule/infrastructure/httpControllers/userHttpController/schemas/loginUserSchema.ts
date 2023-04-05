import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const loginUserBodySchema = Schema.union([
  Schema.object({
    email: Schema.notEmptyString(),
    password: Schema.notEmptyString(),
  }),
  Schema.object({
    phoneNumber: Schema.notEmptyString(),
    password: Schema.notEmptyString(),
  }),
]);

export type LoginUserBody = SchemaType<typeof loginUserBodySchema>;

export const loginUserResponseOkBodySchema = Schema.object({
  token: Schema.string(),
});

export type LoginUserResponseOkBody = SchemaType<typeof loginUserResponseOkBodySchema>;
