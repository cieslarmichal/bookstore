import { Schema } from '../../../../../../../libs/validator/schema';

export const bookCategorySchema = Schema.object({
  id: Schema.notEmptyString(),
  bookId: Schema.notEmptyString(),
  categoryId: Schema.notEmptyString(),
});
