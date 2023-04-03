import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const findOnePayloadSchema = Schema.object({
  id: Schema.notEmptyString().optional(),
  bookId: Schema.notEmptyString().optional(),
  customerId: Schema.notEmptyString().optional(),
});

export type FindOnePayload = SchemaType<typeof findOnePayloadSchema>;