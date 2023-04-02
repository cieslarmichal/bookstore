import { Schema } from '../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../libs/validator/schemaType';

export const createInventoryPayloadSchema = Schema.object({
  bookId: Schema.notEmptyString(),
  quantity: Schema.integer(),
});

export type CreateInventoryPayload = SchemaType<typeof createInventoryPayloadSchema>;
