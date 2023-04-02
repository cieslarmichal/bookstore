import { Schema } from '../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../libs/validator/schemaType';

export const updateBookPayloadSchema = Schema.object({
  id: Schema.notEmptyString(),
  price: Schema.positiveNumber().optional(),
  description: Schema.notEmptyString().optional(),
});

export type UpdateBookPayload = SchemaType<typeof updateBookPayloadSchema>;
