import { updateBookDraftSchema } from './updateBookDraft';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const updateBookPayloadSchema = Schema.object({
  id: Schema.string(),
  draft: updateBookDraftSchema,
});

export type UpdateBookPayload = SchemaType<typeof updateBookPayloadSchema>;
