import { inventorySchema } from './inventorySchema';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const findInventoriesQueryParametersSchema = Schema.object({
  page: Schema.number().optional(),
  limit: Schema.number().optional(),
  bookId: Schema.string().optional(),
});

export type FindInventoriesQueryParameters = SchemaType<typeof findInventoriesQueryParametersSchema>;

export const findInventoriesResponseOkBodySchema = Schema.object({
  data: Schema.array(inventorySchema),
});

export type FindInventoriesResponseOkBody = SchemaType<typeof findInventoriesResponseOkBodySchema>;
