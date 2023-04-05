import { Schema } from '../../../../../../../libs/validator/schema';

export const bookCategorySchema = Schema.object({
  id: Schema.string(),
  bookId: Schema.string(),
  categoryId: Schema.string(),
});
