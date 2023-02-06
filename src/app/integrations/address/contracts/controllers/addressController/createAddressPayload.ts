import { SchemaType } from '../../../../../common/validator/contracts/schemaType';
import { Schema } from '../../../../../common/validator/implementations/schema';

export const createAddressPayloadSchema = Schema.object({
  firstName: Schema.notEmptyString(),
  lastName: Schema.notEmptyString(),
  phoneNumber: Schema.notEmptyString(),
  country: Schema.notEmptyString(),
  state: Schema.notEmptyString(),
  city: Schema.notEmptyString(),
  zipCode: Schema.notEmptyString(),
  streetAddress: Schema.notEmptyString(),
  deliveryInstructions: Schema.notEmptyString().optional(),
  customerId: Schema.notEmptyString().optional(),
});

export type CreateAddressPayload = SchemaType<typeof createAddressPayloadSchema>;
