import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const createInventoryDraftSchema = Schema.object({
  bookId: Schema.string(),
  quantity: Schema.integer(),
});

export type CreateInventoryDraft = SchemaType<typeof createInventoryDraftSchema>;
