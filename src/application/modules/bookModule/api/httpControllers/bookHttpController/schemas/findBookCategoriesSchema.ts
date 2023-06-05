import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';
import { categorySchema } from '../../../../../categoryModule/api/httpControllers/categoryHttpController/schemas/categorySchema';

export const findBookCategoriesPathParametersSchema = Schema.object({
  id: Schema.string(),
});

export type FindBookCategoriesPathParameters = SchemaType<typeof findBookCategoriesPathParametersSchema>;

export const findBookCategoriesQueryParametersSchema = Schema.object({
  page: Schema.string().optional(),
  limit: Schema.string().optional(),
  filter: Schema.unknown().optional(),
});

export type FindBookCategoriesQueryParameters = SchemaType<typeof findBookCategoriesQueryParametersSchema>;

export const findBookCategoriesResponseOkBodySchema = Schema.object({
  data: Schema.array(categorySchema),
});

export type FindBookCategoriesResponseOkBody = SchemaType<typeof findBookCategoriesResponseOkBodySchema>;
