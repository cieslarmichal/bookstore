import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const createUserPayloadSchema = Schema.object({
  id: Schema.string(),
  email: Schema.string().optional(),
  phoneNumber: Schema.string().optional(),
  password: Schema.string(),
});

export type CreateUserPayload = SchemaType<typeof createUserPayloadSchema>;
