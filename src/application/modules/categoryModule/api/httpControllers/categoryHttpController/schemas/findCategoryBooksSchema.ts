import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';
import { bookSchema } from '../../../../../bookModule/api/httpControllers/bookHttpController/schemas/bookSchema';

export const findCategoryBooksPathParametersSchema = Schema.object({
  id: Schema.string(),
});

export type FindCategoryBooksPathParameters = SchemaType<typeof findCategoryBooksPathParametersSchema>;

export const findCategoryBooksQueryParametersSchema = Schema.object({
  page: Schema.string().optional(),
  limit: Schema.string().optional(),
  filter: Schema.unknown().optional(),
});

export type FindCategoryBooksQueryParameters = SchemaType<typeof findCategoryBooksQueryParametersSchema>;

export const findCategoryBooksResponseOkBodySchema = Schema.object({
  data: Schema.array(bookSchema),
});

export type FindCategoryBooksResponseOkBody = SchemaType<typeof findCategoryBooksResponseOkBodySchema>;
