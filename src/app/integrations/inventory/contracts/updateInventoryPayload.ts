import { SchemaType } from '../../../common/validator/contracts/schemaType';
import { Schema } from '../../../common/validator/implementations/schema';

export const updateInventoryPayloadSchema = Schema.object({
  id: Schema.notEmptyString(),
  quantity: Schema.integer(),
});

export type UpdateInventoryPayload = SchemaType<typeof updateInventoryPayloadSchema>;
