import { SchemaType } from '../../../../../common/validator/contracts/schemaType';
import { Schema } from '../../../../../common/validator/implementations/schema';

export const addLineItemDraftSchema = Schema.object({
  bookId: Schema.notEmptyString(),
  quantity: Schema.positiveInteger(),
});

export type AddLineItemDraft = SchemaType<typeof addLineItemDraftSchema>;
