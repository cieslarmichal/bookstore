import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const updateLineItemDraftSchema = Schema.object({
  quantity: Schema.integer().optional(),
  price: Schema.number().optional(),
  totalPrice: Schema.number().optional(),
});

export type UpdateLineItemDraft = SchemaType<typeof updateLineItemDraftSchema>;
