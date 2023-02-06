import { SchemaType } from '../../../common/validator/contracts/schemaType';
import { Schema } from '../../../common/validator/implementations/schema';

export const createBookCategoryPayloadSchema = Schema.object({
  bookId: Schema.notEmptyString(),
  categoryId: Schema.notEmptyString(),
});

export type CreateBookCategoryPayload = SchemaType<typeof createBookCategoryPayloadSchema>;
