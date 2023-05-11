import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const deleteWhishlistEntryPathParametersSchema = Schema.object({
  id: Schema.string(),
});

export type DeleteWhishlistEntryPathParameters = SchemaType<typeof deleteWhishlistEntryPathParametersSchema>;

export const deleteWhishlistEntryResponseNoContentBodySchema = Schema.null();

export type DeleteWhishlistEntryResponseNoContentBody = SchemaType<
  typeof deleteWhishlistEntryResponseNoContentBodySchema
>;
