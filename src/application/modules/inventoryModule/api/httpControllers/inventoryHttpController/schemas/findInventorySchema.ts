import { inventorySchema } from './inventorySchema';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const findInventoryPathParametersSchema = Schema.object({
  id: Schema.string(),
});

export type FindInventoryPathParameters = SchemaType<typeof findInventoryPathParametersSchema>;

export const findInventoryResponseOkBodySchema = Schema.object({
  inventory: inventorySchema,
});

export type FindInventoryResponseOkBody = SchemaType<typeof findInventoryResponseOkBodySchema>;
