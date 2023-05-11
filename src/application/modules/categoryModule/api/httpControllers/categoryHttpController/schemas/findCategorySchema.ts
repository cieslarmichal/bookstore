import { categorySchema } from './categorySchema';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const findCategoryPathParametersSchema = Schema.object({
  id: Schema.string(),
});

export type FindCategoryPathParameters = SchemaType<typeof findCategoryPathParametersSchema>;

export const findCategoryResponseOkBodySchema = Schema.object({
  category: categorySchema,
});

export type FindCategoryResponseOkBody = SchemaType<typeof findCategoryResponseOkBodySchema>;
