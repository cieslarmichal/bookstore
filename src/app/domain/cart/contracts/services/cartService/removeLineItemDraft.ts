import { SchemaType } from '../../../../../common/validator/contracts/schemaType';
import { Schema } from '../../../../../common/validator/implementations/schema';

export const removeLineItemDraftSchema = Schema.object({
  lineItemId: Schema.notEmptyString(),
  quantity: Schema.positiveInteger(),
});

export type RemoveLineItemDraft = SchemaType<typeof removeLineItemDraftSchema>;
