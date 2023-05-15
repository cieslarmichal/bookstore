import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const deleteBookCategoryPayloadSchema = Schema.object({
  id: Schema.string(),
});

export type DeleteBookCategoryPayload = SchemaType<typeof deleteBookCategoryPayloadSchema>;
