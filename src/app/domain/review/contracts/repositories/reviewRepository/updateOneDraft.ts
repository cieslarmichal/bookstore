import { SchemaType } from '../../../../../libs/validator/contracts/schemaType';
import { Schema } from '../../../../../libs/validator/implementations/schema';

export const updateOneDraftSchema = Schema.object({
  rate: Schema.positiveInteger().optional(),
  comment: Schema.notEmptyString().optional(),
});

export type UpdateOneDraft = SchemaType<typeof updateOneDraftSchema>;
