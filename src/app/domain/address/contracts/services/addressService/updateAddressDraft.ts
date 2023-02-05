import { SchemaType } from '../../../../../common/validator/contracts/schemaType';
import { Schema } from '../../../../../common/validator/implementations/schema';

export const updateAddressDraftSchema = Schema.object({
  firstName: Schema.notEmptyString().optional(),
  lastName: Schema.notEmptyString().optional(),
  phoneNumber: Schema.notEmptyString().optional(),
  country: Schema.notEmptyString().optional(),
  state: Schema.notEmptyString().optional(),
  city: Schema.notEmptyString().optional(),
  zipCode: Schema.notEmptyString().optional(),
  streetAddress: Schema.notEmptyString().optional(),
  deliveryInstructions: Schema.notEmptyString().optional(),
});

export type UpdateAddressDraft = SchemaType<typeof updateAddressDraftSchema>;
