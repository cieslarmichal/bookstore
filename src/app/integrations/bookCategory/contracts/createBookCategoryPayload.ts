import { SchemaType } from '../../../libs/validator/contracts/schemaType';
import { Schema } from '../../../libs/validator/implementations/schema';

export const createBookCategoryPayloadSchema = Schema.object({
  bookId: Schema.notEmptyString(),
  categoryId: Schema.notEmptyString(),
});

export type CreateBookCategoryPayload = SchemaType<typeof createBookCategoryPayloadSchema>;
