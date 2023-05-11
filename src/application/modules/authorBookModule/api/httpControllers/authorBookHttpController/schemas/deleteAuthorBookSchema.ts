import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const deleteAuthorBookPathParametersSchema = Schema.object({
  authorId: Schema.string(),
  bookId: Schema.string(),
});

export type DeleteAuthorBookPathParameters = SchemaType<typeof deleteAuthorBookPathParametersSchema>;

export const deleteAuthorBookResponseNoContentBodySchema = Schema.null();

export type DeleteAuthorBookResponseNoContentBody = SchemaType<typeof deleteAuthorBookResponseNoContentBodySchema>;
