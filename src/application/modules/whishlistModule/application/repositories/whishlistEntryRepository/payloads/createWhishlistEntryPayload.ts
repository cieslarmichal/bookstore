import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const createWhishlistEntryPayloadSchema = Schema.object({
  id: Schema.string(),
  bookId: Schema.string(),
  customerId: Schema.string(),
});

export type CreateWhishlistEntryPayload = SchemaType<typeof createWhishlistEntryPayloadSchema>;
