import { Schema } from '../../../../../../../libs/validator/schema';

export const authorBookSchema = Schema.object({
  id: Schema.notEmptyString(),
  authorId: Schema.notEmptyString(),
  bookId: Schema.notEmptyString(),
});
