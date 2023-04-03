import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const deleteBookPathParametersSchema = Schema.object({
  id: Schema.string(),
});

export type DeleteBookPathParameters = SchemaType<typeof deleteBookPathParametersSchema>;

export const deleteBookResponseNoContentBodySchema = Schema.null();

export type DeleteBookResponseNoContentBody = SchemaType<typeof deleteBookResponseNoContentBodySchema>;
