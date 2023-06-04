import { inventorySchema } from './inventorySchema';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const findInventoriesQueryParametersSchema = Schema.object({
  page: Schema.string().optional(),
  limit: Schema.string().optional(),
  bookId: Schema.string().optional(),
});

export type FindInventoriesQueryParameters = SchemaType<typeof findInventoriesQueryParametersSchema>;

export const findInventoriesResponseOkBodySchema = Schema.object({
  data: Schema.array(inventorySchema),
});

export type FindInventoriesResponseOkBody = SchemaType<typeof findInventoriesResponseOkBodySchema>;
