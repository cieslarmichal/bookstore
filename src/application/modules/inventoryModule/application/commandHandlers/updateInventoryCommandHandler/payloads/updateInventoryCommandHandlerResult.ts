import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';
import { Inventory } from '../../../../domain/entities/inventory/inventory';

export const updateInventoryCommandHandlerResultSchema = Schema.object({
  inventory: Schema.instanceof(Inventory),
});

export type UpdateInventoryCommandHandlerResult = SchemaType<typeof updateInventoryCommandHandlerResultSchema>;
