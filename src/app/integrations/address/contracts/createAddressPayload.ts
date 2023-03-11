import { SchemaType } from '../../../../libs/validator/contracts/schemaType';
import { Schema } from '../../../../libs/validator/implementations/schema';
import { AccessTokenData } from '../../accessTokenData';

export const createAddressPayloadSchema = Schema.object({
  firstName: Schema.notEmptyString(),
  lastName: Schema.notEmptyString(),
  phoneNumber: Schema.notEmptyString(),
  country: Schema.notEmptyString(),
  state: Schema.notEmptyString(),
  city: Schema.notEmptyString(),
  zipCode: Schema.notEmptyString(),
  streetAddress: Schema.notEmptyString(),
  customerId: Schema.notEmptyString(),
  deliveryInstructions: Schema.notEmptyString().optional(),
  accessTokenData: Schema.unsafeType<AccessTokenData>(),
});

export type CreateAddressPayload = SchemaType<typeof createAddressPayloadSchema>;
