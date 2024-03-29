import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const addLineItemDraftSchema = Schema.object({
  bookId: Schema.string(),
  quantity: Schema.positiveInteger(),
});

export type AddLineItemDraft = SchemaType<typeof addLineItemDraftSchema>;
