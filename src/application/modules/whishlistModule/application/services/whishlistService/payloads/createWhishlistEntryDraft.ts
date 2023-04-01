import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const createWhishlistEntryDraftSchema = Schema.object({
  bookId: Schema.notEmptyString(),
  customerId: Schema.notEmptyString(),
});

export type CreateWhishlistEntryDraft = SchemaType<typeof createWhishlistEntryDraftSchema>;
