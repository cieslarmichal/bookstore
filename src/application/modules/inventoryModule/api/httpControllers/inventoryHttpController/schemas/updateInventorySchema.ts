import { inventorySchema } from './inventorySchema';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const updateInventoryPathParametersSchema = Schema.object({
  id: Schema.string(),
});

export type UpdateInventoryPathParameters = SchemaType<typeof updateInventoryPathParametersSchema>;

export const updateInventoryBodySchema = Schema.object({
  quantity: Schema.integer(),
});

export type UpdateInventoryBody = SchemaType<typeof updateInventoryBodySchema>;

export const updateInventoryResponseOkBodySchema = Schema.object({
  inventory: inventorySchema,
});

export type UpdateInventoryResponseOkBody = SchemaType<typeof updateInventoryResponseOkBodySchema>;
