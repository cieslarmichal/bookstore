import { SchemaType } from '../../../../../common/validator/contracts/schemaType';
import { Schema } from '../../../../../common/validator/implementations/schema';

export const updateOneDraftSchema = Schema.object({
  quantity: Schema.integer().optional(),
  price: Schema.number().optional(),
  totalPrice: Schema.number().optional(),
});

export type UpdateOneDraft = SchemaType<typeof updateOneDraftSchema>;
