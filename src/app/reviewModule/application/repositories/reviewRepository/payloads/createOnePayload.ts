import { SchemaType } from '../../../../../../libs/validator/schemaType';
import { Schema } from '../../../../../../libs/validator/schema';

export const createOnePayloadSchema = Schema.object({
  id: Schema.notEmptyString(),
  isbn: Schema.notEmptyString(),
  rate: Schema.positiveInteger(),
  comment: Schema.notEmptyString().optional(),
  customerId: Schema.notEmptyString(),
});

export type CreateOnePayload = SchemaType<typeof createOnePayloadSchema>;
