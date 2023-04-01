import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const updateOneDraftSchema = Schema.object({
  password: Schema.notEmptyString().optional(),
  email: Schema.notEmptyString().optional(),
  phoneNumber: Schema.notEmptyString().optional(),
});

export type UpdateOneDraft = SchemaType<typeof updateOneDraftSchema>;
