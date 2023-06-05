import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';
import { bookSchema } from '../../../../../bookModule/api/httpControllers/bookHttpController/schemas/bookSchema';

export const findAuthorBooksPathParametersSchema = Schema.object({
  id: Schema.string(),
});

export type FindAuthorBooksPathParameters = SchemaType<typeof findAuthorBooksPathParametersSchema>;

export const findAuthorBooksQueryParametersSchema = Schema.object({
  page: Schema.string().optional(),
  limit: Schema.string().optional(),
  filter: Schema.unknown().optional(),
});

export type FindAuthorBooksQueryParameters = SchemaType<typeof findAuthorBooksQueryParametersSchema>;

export const findAuthorBooksResponseOkBodySchema = Schema.object({
  data: Schema.array(bookSchema),
});

export type FindAuthorBooksResponseOkBody = SchemaType<typeof findAuthorBooksResponseOkBodySchema>;
