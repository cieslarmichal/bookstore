import { SchemaType } from '../../../libs/validator/contracts/schemaType';
import { Schema } from '../../../libs/validator/implementations/schema';

export const deleteBookCategoryPayloadSchema = Schema.object({
  bookId: Schema.notEmptyString(),
  categoryId: Schema.notEmptyString(),
});

export type DeleteBookCategoryPayload = SchemaType<typeof deleteBookCategoryPayloadSchema>;
