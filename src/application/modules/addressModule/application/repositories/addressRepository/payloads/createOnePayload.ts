import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const createOnePayloadSchema = Schema.object({
  id: Schema.string(),
  firstName: Schema.string(),
  lastName: Schema.string(),
  phoneNumber: Schema.string(),
  country: Schema.string(),
  state: Schema.string(),
  city: Schema.string(),
  zipCode: Schema.string(),
  streetAddress: Schema.string(),
  customerId: Schema.string(),
  deliveryInstructions: Schema.string().optional(),
});

export type CreateOnePayload = SchemaType<typeof createOnePayloadSchema>;
