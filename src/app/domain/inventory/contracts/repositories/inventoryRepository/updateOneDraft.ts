import { SchemaType } from '../../../../../../libs/validator/contracts/schemaType';
import { Schema } from '../../../../../../libs/validator/implementations/schema';

export const updateOneDraftSchema = Schema.object({
  quantity: Schema.number(),
});

export type UpdateOneDraft = SchemaType<typeof updateOneDraftSchema>;
