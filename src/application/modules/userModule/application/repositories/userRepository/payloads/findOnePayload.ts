import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const findOnePayloadSchema = Schema.object({
  id: Schema.string().optional(),
  email: Schema.string().optional(),
  phoneNumber: Schema.string().optional(),
});

export type FindOnePayload = SchemaType<typeof findOnePayloadSchema>;
