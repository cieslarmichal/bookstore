import { updateLineItemDraftSchema } from './updateLineItemDraft';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const updateLineItemPayloadSchema = Schema.object({
  id: Schema.string(),
  draft: updateLineItemDraftSchema,
});

export type UpdateLineItemPayload = SchemaType<typeof updateLineItemPayloadSchema>;
