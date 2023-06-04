import { categorySchema } from './categorySchema';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const findCategoriesQueryParametersSchema = Schema.object({
  page: Schema.string().optional(),
  limit: Schema.string().optional(),
  filter: Schema.unknown().optional(),
});

export type FindCategoriesQueryParameters = SchemaType<typeof findCategoriesQueryParametersSchema>;

export const findCategoriesResponseOkBodySchema = Schema.object({
  data: Schema.array(categorySchema),
});

export type FindCategoriesResponseOkBody = SchemaType<typeof findCategoriesResponseOkBodySchema>;
