import { SchemaType } from '../../../../../common/validator/contracts/schemaType';
import { Schema } from '../../../../../common/validator/implementations/schema';

export const updateOneDraftSchema = Schema.object({
  price: Schema.positiveNumber().optional(),
  description: Schema.notEmptyString().optional(),
});

export type UpdateOneDraft = SchemaType<typeof updateOneDraftSchema>;
