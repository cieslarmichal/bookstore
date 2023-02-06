import { SchemaType } from '../../../../../common/validator/contracts/schemaType';
import { Schema } from '../../../../../common/validator/implementations/schema';

export const updateBookPayloadSchema = Schema.object({
  id: Schema.notEmptyString(),
  price: Schema.positiveNumber().optional(),
  description: Schema.notEmptyString().optional(),
});

export type UpdateBookPayload = SchemaType<typeof updateBookPayloadSchema>;
