import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const createBookCategoryDraftSchema = Schema.object({
  bookId: Schema.string(),
  categoryId: Schema.string(),
});

export type CreateBookCategoryDraft = SchemaType<typeof createBookCategoryDraftSchema>;
