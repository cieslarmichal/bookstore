import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const deleteAddressPayloadSchema = Schema.object({
  id: Schema.string(),
});

export type DeleteAddressPayload = SchemaType<typeof deleteAddressPayloadSchema>;
