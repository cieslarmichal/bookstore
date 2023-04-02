import { Schema } from '../../../../../../../libs/validator/schema';

export const addressSchema = Schema.object({
  id: Schema.notEmptyString(),
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
});
