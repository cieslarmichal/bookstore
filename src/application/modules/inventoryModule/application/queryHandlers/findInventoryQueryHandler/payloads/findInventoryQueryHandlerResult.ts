import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';
import { Inventory } from '../../../../domain/entities/inventory/inventory';

export const findInventoryQueryHandlerResultSchema = Schema.object({
  inventory: Schema.instanceof(Inventory),
});

export type FindInventoryQueryHandlerResult = SchemaType<typeof findInventoryQueryHandlerResultSchema>;
