import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const updateAddressDraftSchema = Schema.object({
  firstName: Schema.string().optional(),
  lastName: Schema.string().optional(),
  phoneNumber: Schema.string().optional(),
  country: Schema.string().optional(),
  state: Schema.string().optional(),
  city: Schema.string().optional(),
  zipCode: Schema.string().optional(),
  streetAddress: Schema.string().optional(),
  deliveryInstructions: Schema.string().optional(),
});

export type UpdateAddressDraft = SchemaType<typeof updateAddressDraftSchema>;
