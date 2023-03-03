import { SchemaType } from '../../../libs/validator/contracts/schemaType';
import { Schema } from '../../../libs/validator/implementations/schema';

export const updateInventoryPayloadSchema = Schema.object({
  id: Schema.notEmptyString(),
  quantity: Schema.integer(),
});

export type UpdateInventoryPayload = SchemaType<typeof updateInventoryPayloadSchema>;
