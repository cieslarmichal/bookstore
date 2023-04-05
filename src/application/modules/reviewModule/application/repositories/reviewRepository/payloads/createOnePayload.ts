import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const createOnePayloadSchema = Schema.object({
  id: Schema.string(),
  isbn: Schema.string(),
  rate: Schema.positiveInteger(),
  comment: Schema.string().optional(),
  customerId: Schema.string(),
});

export type CreateOnePayload = SchemaType<typeof createOnePayloadSchema>;
