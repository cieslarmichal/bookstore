import { Schema } from '../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../libs/validator/schemaType';

export const loginUserPayloadSchema = Schema.object({
  email: Schema.string().optional(),
  phoneNumber: Schema.string().optional(),
  password: Schema.string(),
});

export type LoginUserPayload = SchemaType<typeof loginUserPayloadSchema>;
