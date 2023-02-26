import { SchemaType } from '../../../../../common/validator/contracts/schemaType';
import { Schema } from '../../../../../common/validator/implementations/schema';

export const createInventoryDraftSchema = Schema.object({
  bookId: Schema.notEmptyString(),
  quantity: Schema.integer(),
});

export type CreateInventoryDraft = SchemaType<typeof createInventoryDraftSchema>;
