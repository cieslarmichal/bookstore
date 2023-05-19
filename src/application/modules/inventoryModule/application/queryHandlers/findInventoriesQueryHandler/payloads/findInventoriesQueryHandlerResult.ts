import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';
import { Inventory } from '../../../../domain/entities/inventory/inventory';

export const findInventoriesQueryHandlerResultSchema = Schema.object({
  inventories: Schema.array(Schema.instanceof(Inventory)),
});

export type FindInventoriesQueryHandlerResult = SchemaType<typeof findInventoriesQueryHandlerResultSchema>;
