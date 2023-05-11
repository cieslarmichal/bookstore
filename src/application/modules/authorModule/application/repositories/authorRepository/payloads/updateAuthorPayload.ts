import { updateAuthorDraftSchema } from './updateAuthorDraft';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const updateAuthorPayloadSchema = Schema.object({
  id: Schema.string(),
  draft: updateAuthorDraftSchema,
});

export type UpdateAuthorPayload = SchemaType<typeof updateAuthorPayloadSchema>;
