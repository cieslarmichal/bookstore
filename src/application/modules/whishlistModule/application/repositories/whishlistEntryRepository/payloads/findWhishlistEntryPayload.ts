import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const findWhishlistEntryPayloadSchema = Schema.object({
  id: Schema.string().optional(),
  bookId: Schema.string().optional(),
  customerId: Schema.string().optional(),
});

export type FindWhishlistEntryPayload = SchemaType<typeof findWhishlistEntryPayloadSchema>;
