import { SchemaType } from '../../../../../libs/validator/contracts/schemaType';
import { Schema } from '../../../../../libs/validator/implementations/schema';

export const createWhishlistEntryDraftSchema = Schema.object({
  bookId: Schema.notEmptyString(),
  customerId: Schema.notEmptyString(),
});

export type CreateWhishlistEntryDraft = SchemaType<typeof createWhishlistEntryDraftSchema>;
