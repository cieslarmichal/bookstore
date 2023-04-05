import { Schema } from '../../../../../../../libs/validator/schema';

export const authorBookSchema = Schema.object({
  id: Schema.string(),
  authorId: Schema.string(),
  bookId: Schema.string(),
});
