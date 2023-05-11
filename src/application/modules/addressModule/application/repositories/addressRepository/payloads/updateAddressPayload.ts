import { updateAddressDraftSchema } from './updateAddressDraft';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const updateAddressPayloadSchema = Schema.object({
  id: Schema.string(),
  draft: updateAddressDraftSchema,
});

export type UpdateAddressPayload = SchemaType<typeof updateAddressPayloadSchema>;
