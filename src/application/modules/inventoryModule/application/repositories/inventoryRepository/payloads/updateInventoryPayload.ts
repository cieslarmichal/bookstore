import { updateInventoryDraftSchema } from './updateInventoryDraft';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const updateInventoryPayloadSchema = Schema.object({
  id: Schema.string(),
  draft: updateInventoryDraftSchema,
});

export type UpdateInventoryPayload = SchemaType<typeof updateInventoryPayloadSchema>;
