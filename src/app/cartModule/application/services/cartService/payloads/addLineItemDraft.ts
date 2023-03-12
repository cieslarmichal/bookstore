import { Schema } from '../../../../../../libs/validator/implementations/schema';
import { SchemaType } from '../../../../../../libs/validator/schemaType';

export const addLineItemDraftSchema = Schema.object({
  bookId: Schema.notEmptyString(),
  quantity: Schema.positiveInteger(),
});

export type AddLineItemDraft = SchemaType<typeof addLineItemDraftSchema>;
