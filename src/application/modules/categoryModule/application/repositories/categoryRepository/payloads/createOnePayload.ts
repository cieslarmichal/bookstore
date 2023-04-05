import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const createOnePayloadSchema = Schema.object({
  id: Schema.string(),
  name: Schema.string(),
});

export type CreateOnePayload = SchemaType<typeof createOnePayloadSchema>;
