import { Schema } from '../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../libs/validator/schemaType';

export const updateInventoryDraftSchema = Schema.object({
  quantity: Schema.positiveInteger(),
});

export type UpdateInventoryDraft = SchemaType<typeof updateInventoryDraftSchema>;
