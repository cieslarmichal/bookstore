import { SchemaType } from '../../../common/validator/contracts/schemaType';
import { Schema } from '../../../common/validator/implementations/schema';

export const deleteBookCategoryPayloadSchema = Schema.object({
  bookId: Schema.notEmptyString(),
  categoryId: Schema.notEmptyString(),
});

export type DeleteBookCategoryPayload = SchemaType<typeof deleteBookCategoryPayloadSchema>;
