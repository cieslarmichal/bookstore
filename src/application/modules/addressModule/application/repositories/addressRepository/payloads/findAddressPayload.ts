import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const findAddressPayloadSchema = Schema.object({
  id: Schema.string(),
});

export type FindAddressPayload = SchemaType<typeof findAddressPayloadSchema>;
