import { SchemaType } from '../../../../../common/validator/contracts/schemaType';
import { Schema } from '../../../../../common/validator/implementations/schema';

export const deleteAddressPayloadSchema = Schema.object({
  id: Schema.notEmptyString(),
});

export type DeleteAddressPayload = SchemaType<typeof deleteAddressPayloadSchema>;
