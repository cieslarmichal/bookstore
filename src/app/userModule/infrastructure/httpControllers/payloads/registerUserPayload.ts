import { Schema } from '../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../libs/validator/schemaType';

export const registerUserPayloadSchema = Schema.object({
  email: Schema.notEmptyString().optional(),
  phoneNumber: Schema.notEmptyString().optional(),
  password: Schema.notEmptyString(),
});

export type RegisterUserPayload = SchemaType<typeof registerUserPayloadSchema>;
