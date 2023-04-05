import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const updateOneDraftSchema = Schema.object({
  rate: Schema.positiveInteger().optional(),
  comment: Schema.string().optional(),
});

export type UpdateOneDraft = SchemaType<typeof updateOneDraftSchema>;
