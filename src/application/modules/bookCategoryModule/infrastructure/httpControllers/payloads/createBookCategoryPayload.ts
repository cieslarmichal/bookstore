import { Schema } from '../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../libs/validator/schemaType';

export const createBookCategoryPayloadSchema = Schema.object({
  bookId: Schema.notEmptyString(),
  categoryId: Schema.notEmptyString(),
});

export type CreateBookCategoryPayload = SchemaType<typeof createBookCategoryPayloadSchema>;
