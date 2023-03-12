import { Schema } from '../../../../../../libs/validator/implementations/schema';
import { SchemaType } from '../../../../../../libs/validator/schemaType';

export const updateOneDraftSchema = Schema.object({
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

export type UpdateOneDraft = SchemaType<typeof updateOneDraftSchema>;
