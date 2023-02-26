import { SchemaType } from '../../../../../common/validator/contracts/schemaType';
import { Schema } from '../../../../../common/validator/implementations/schema';

export const updateOneDraftSchema = Schema.object({
  quantity: Schema.number(),
});

export type UpdateOneDraft = SchemaType<typeof updateOneDraftSchema>;
