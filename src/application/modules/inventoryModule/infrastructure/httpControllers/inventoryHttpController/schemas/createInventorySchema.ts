import { inventorySchema } from './inventorySchema';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const createInventoryBodySchema = Schema.object({
  bookId: Schema.notEmptyString(),
  quantity: Schema.integer(),
});

export type CreateInventoryBody = SchemaType<typeof createInventoryBodySchema>;

export const createInventoryResponseCreatedBodySchema = Schema.object({
  inventory: inventorySchema,
});

export type CreateInventoryResponseCreatedBody = SchemaType<typeof createInventoryResponseCreatedBodySchema>;
