import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const deleteWhishlistEntryPayloadSchema = Schema.object({
  id: Schema.string(),
});

export type DeleteWhishlistEntryPayload = SchemaType<typeof deleteWhishlistEntryPayloadSchema>;
