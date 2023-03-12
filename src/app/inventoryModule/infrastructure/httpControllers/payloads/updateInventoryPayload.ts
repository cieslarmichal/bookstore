import { SchemaType } from '../../../../../libs/validator/schemaType';
import { Schema } from '../../../../../libs/validator/schema';

export const updateInventoryPayloadSchema = Schema.object({
  id: Schema.notEmptyString(),
  quantity: Schema.integer(),
});

export type UpdateInventoryPayload = SchemaType<typeof updateInventoryPayloadSchema>;
