import { SchemaType } from '../../../common/validator/contracts/schemaType';
import { Schema } from '../../../common/validator/implementations/schema';

export const createInventoryPayloadSchema = Schema.object({
  bookId: Schema.notEmptyString(),
  quantity: Schema.integer(),
});

export type CreateInventoryPayload = SchemaType<typeof createInventoryPayloadSchema>;
