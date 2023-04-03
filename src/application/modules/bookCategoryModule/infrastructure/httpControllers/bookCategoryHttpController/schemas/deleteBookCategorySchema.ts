import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const deleteBookCategoryPathParametersSchema = Schema.object({
  bookId: Schema.notEmptyString(),
  categoryId: Schema.notEmptyString(),
});

export type DeleteBookCategoryPathParameters = SchemaType<typeof deleteBookCategoryPathParametersSchema>;

export const deleteBookCategoryResponseNoContentBodySchema = Schema.null();

export type DeleteBookCategoryResponseNoContentBody = SchemaType<typeof deleteBookCategoryResponseNoContentBodySchema>;
