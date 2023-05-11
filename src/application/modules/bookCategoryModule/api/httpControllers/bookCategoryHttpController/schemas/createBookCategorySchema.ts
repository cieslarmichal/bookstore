import { bookCategorySchema } from './bookCategorySchema';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const createBookCategoryPathParametersSchema = Schema.object({
  bookId: Schema.string(),
  categoryId: Schema.string(),
});

export type CreateBookCategoryPathParameters = SchemaType<typeof createBookCategoryPathParametersSchema>;

export const createBookCategoryResponseCreatedBodySchema = Schema.object({
  bookCategory: bookCategorySchema,
});

export type CreateBookCategoryResponseCreatedBody = SchemaType<typeof createBookCategoryResponseCreatedBodySchema>;
