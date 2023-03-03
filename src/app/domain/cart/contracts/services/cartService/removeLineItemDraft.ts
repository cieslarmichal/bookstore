import { SchemaType } from '../../../../../libs/validator/contracts/schemaType';
import { Schema } from '../../../../../libs/validator/implementations/schema';

export const removeLineItemDraftSchema = Schema.object({
  lineItemId: Schema.notEmptyString(),
  quantity: Schema.positiveInteger(),
});

export type RemoveLineItemDraft = SchemaType<typeof removeLineItemDraftSchema>;
