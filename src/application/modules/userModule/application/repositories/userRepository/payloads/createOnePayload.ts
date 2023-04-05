import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const createOnePayloadSchema = Schema.object({
  id: Schema.string(),
  email: Schema.string().optional(),
  phoneNumber: Schema.string().optional(),
  password: Schema.string(),
});

export type CreateOnePayload = SchemaType<typeof createOnePayloadSchema>;
