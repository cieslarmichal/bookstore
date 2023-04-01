import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const createBookCategoryDraftSchema = Schema.object({
  bookId: Schema.notEmptyString(),
  categoryId: Schema.notEmptyString(),
});

export type CreateBookCategoryDraft = SchemaType<typeof createBookCategoryDraftSchema>;
