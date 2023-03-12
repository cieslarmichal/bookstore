import { Schema } from '../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../libs/validator/schemaType';

export const updateInventoryPayloadSchema = Schema.object({
  id: Schema.notEmptyString(),
  quantity: Schema.integer(),
});

export type UpdateInventoryPayload = SchemaType<typeof updateInventoryPayloadSchema>;
