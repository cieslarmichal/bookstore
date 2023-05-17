import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const updateBookDraftSchema = Schema.object({
  price: Schema.positiveNumber().optional(),
  description: Schema.string().optional(),
});

export type UpdateBookDraft = SchemaType<typeof updateBookDraftSchema>;
