import { SchemaType } from '../../../../../../libs/validator/schemaType';
import { Schema } from '../../../../../../libs/validator/implementations/schema';

export const updateOneDraftSchema = Schema.object({
  quantity: Schema.integer().optional(),
  price: Schema.number().optional(),
  totalPrice: Schema.number().optional(),
});

export type UpdateOneDraft = SchemaType<typeof updateOneDraftSchema>;
