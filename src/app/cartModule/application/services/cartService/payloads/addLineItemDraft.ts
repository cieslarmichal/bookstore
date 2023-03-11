import { SchemaType } from '../../../../../../libs/validator/contracts/schemaType';
import { Schema } from '../../../../../../libs/validator/implementations/schema';

export const addLineItemDraftSchema = Schema.object({
  bookId: Schema.notEmptyString(),
  quantity: Schema.positiveInteger(),
});

export type AddLineItemDraft = SchemaType<typeof addLineItemDraftSchema>;
