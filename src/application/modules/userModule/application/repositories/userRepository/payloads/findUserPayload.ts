import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const findUserPayloadSchema = Schema.object({
  id: Schema.string().optional(),
  email: Schema.string().optional(),
  phoneNumber: Schema.string().optional(),
});

export type FindUserPayload = SchemaType<typeof findUserPayloadSchema>;
