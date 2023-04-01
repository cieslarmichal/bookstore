import { AccessTokenData } from '../../../../../../common/types/accessTokenData';
import { Schema } from '../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../libs/validator/schemaType';

export const updateAddressPayloadSchema = Schema.object({
  id: Schema.notEmptyString(),
  firstName: Schema.notEmptyString().optional(),
  lastName: Schema.notEmptyString().optional(),
  phoneNumber: Schema.notEmptyString().optional(),
  country: Schema.notEmptyString().optional(),
  state: Schema.notEmptyString().optional(),
  city: Schema.notEmptyString().optional(),
  zipCode: Schema.notEmptyString().optional(),
  streetAddress: Schema.notEmptyString().optional(),
  deliveryInstructions: Schema.notEmptyString().optional(),
  accessTokenData: Schema.unsafeType<AccessTokenData>(),
});

export type UpdateAddressPayload = SchemaType<typeof updateAddressPayloadSchema>;
