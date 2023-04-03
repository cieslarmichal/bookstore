import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const deleteAuthorPathParametersSchema = Schema.object({
  id: Schema.string(),
});

export type DeleteAuthorPathParameters = SchemaType<typeof deleteAuthorPathParametersSchema>;

export const deleteAuthorResponseNoContentBodySchema = Schema.null();

export type DeleteAuthorResponseNoContentBody = SchemaType<typeof deleteAuthorResponseNoContentBodySchema>;
