import { updateUserDraftSchema } from './updateUserDraft';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const updateUserPayloadSchema = Schema.object({
  id: Schema.string(),
  draft: updateUserDraftSchema,
});

export type UpdateUserPayload = SchemaType<typeof updateUserPayloadSchema>;
