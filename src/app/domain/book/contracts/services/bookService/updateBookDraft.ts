import { SchemaType } from '../../../../../libs/validator/contracts/schemaType';
import { Schema } from '../../../../../libs/validator/implementations/schema';

export const updateBookDraftSchema = Schema.object({
  price: Schema.positiveNumber().optional(),
  description: Schema.notEmptyString().optional(),
});

export type UpdateBookDraft = SchemaType<typeof updateBookDraftSchema>;
