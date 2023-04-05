import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const createOnePayloadSchema = Schema.object({
  id: Schema.string(),
  bookId: Schema.string(),
  quantity: Schema.integer(),
});

export type CreateOnePayload = SchemaType<typeof createOnePayloadSchema>;
