import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';
import { BookCategory } from '../../../../domain/entities/bookCategory/bookCategory';

export const createBookCategoryCommandHandlerResultSchema = Schema.object({
  bookCategory: Schema.instanceof(BookCategory),
});

export type CreateBookCategoryCommandHandlerResult = SchemaType<typeof createBookCategoryCommandHandlerResultSchema>;
