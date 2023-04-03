import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const deleteCategoryPathParametersSchema = Schema.object({
  id: Schema.string(),
});

export type DeleteCategoryPathParameters = SchemaType<typeof deleteCategoryPathParametersSchema>;

export const deleteCategoryResponseNoContentBodySchema = Schema.null();

export type DeleteCategoryResponseNoContentBody = SchemaType<typeof deleteCategoryResponseNoContentBodySchema>;
