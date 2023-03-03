import { SchemaType } from '../../../../../libs/validator/contracts/schemaType';
import { Schema } from '../../../../../libs/validator/implementations/schema';

export const updateInventoryDraftSchema = Schema.object({
  quantity: Schema.positiveInteger(),
});

export type UpdateInventoryDraft = SchemaType<typeof updateInventoryDraftSchema>;
