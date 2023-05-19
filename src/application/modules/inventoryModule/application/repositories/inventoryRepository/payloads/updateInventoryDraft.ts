import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const updateInventoryDraftSchema = Schema.object({
  quantity: Schema.number(),
});

export type UpdateInventoryDraft = SchemaType<typeof updateInventoryDraftSchema>;
