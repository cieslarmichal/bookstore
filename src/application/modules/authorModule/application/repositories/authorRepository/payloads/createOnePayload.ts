import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const createOnePayloadSchema = Schema.object({
  id: Schema.string(),
  firstName: Schema.string(),
  lastName: Schema.string(),
  about: Schema.string().optional(),
});

export type CreateOnePayload = SchemaType<typeof createOnePayloadSchema>;
