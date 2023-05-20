import { updateCartDraftSchema } from './updateCartDraft';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const updateCartPayloadSchema = Schema.object({
  id: Schema.string(),
  draft: updateCartDraftSchema,
});

export type UpdateCartPayload = SchemaType<typeof updateCartPayloadSchema>;
