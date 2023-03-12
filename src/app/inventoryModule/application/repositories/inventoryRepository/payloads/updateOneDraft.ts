import { Schema } from '../../../../../../libs/validator/implementations/schema';
import { SchemaType } from '../../../../../../libs/validator/schemaType';

export const updateOneDraftSchema = Schema.object({
  quantity: Schema.number(),
});

export type UpdateOneDraft = SchemaType<typeof updateOneDraftSchema>;
