import { Schema } from '../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../libs/validator/schemaType';

export const registerUserPayloadSchema = Schema.object({
  email: Schema.string().optional(),
  phoneNumber: Schema.string().optional(),
  password: Schema.string(),
});

export type RegisterUserPayload = SchemaType<typeof registerUserPayloadSchema>;
