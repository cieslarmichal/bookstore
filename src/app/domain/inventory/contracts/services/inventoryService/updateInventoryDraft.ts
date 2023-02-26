import { SchemaType } from '../../../../../common/validator/contracts/schemaType';
import { Schema } from '../../../../../common/validator/implementations/schema';

export const updateInventoryDraftSchema = Schema.object({
  quantity: Schema.positiveInteger(),
});

export type UpdateInventoryDraft = SchemaType<typeof updateInventoryDraftSchema>;
