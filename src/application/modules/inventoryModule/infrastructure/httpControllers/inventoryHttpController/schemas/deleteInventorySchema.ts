import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const deleteInventoryPathParametersSchema = Schema.object({
  id: Schema.string(),
});

export type DeleteInventoryPathParameters = SchemaType<typeof deleteInventoryPathParametersSchema>;

export const deleteInventoryResponseNoContentBodySchema = Schema.null();

export type DeleteInventoryResponseNoContentBody = SchemaType<typeof deleteInventoryResponseNoContentBodySchema>;
