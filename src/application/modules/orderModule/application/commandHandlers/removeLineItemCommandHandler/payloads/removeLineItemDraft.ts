import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const removeLineItemDraftSchema = Schema.object({
  lineItemId: Schema.string(),
  quantity: Schema.positiveInteger(),
});

export type RemoveLineItemDraft = SchemaType<typeof removeLineItemDraftSchema>;
