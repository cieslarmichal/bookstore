import { SchemaType } from '../../../libs/validator/contracts/schemaType';
import { Schema } from '../../../libs/validator/implementations/schema';

export const createInventoryPayloadSchema = Schema.object({
  bookId: Schema.notEmptyString(),
  quantity: Schema.integer(),
});

export type CreateInventoryPayload = SchemaType<typeof createInventoryPayloadSchema>;
