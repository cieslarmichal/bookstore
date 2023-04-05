import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const updateOneDraftSchema = Schema.object({
  price: Schema.positiveNumber().optional(),
  description: Schema.string().optional(),
});

export type UpdateOneDraft = SchemaType<typeof updateOneDraftSchema>;
