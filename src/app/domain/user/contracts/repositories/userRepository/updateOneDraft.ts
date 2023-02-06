import { SchemaType } from '../../../../../common/validator/contracts/schemaType';
import { Schema } from '../../../../../common/validator/implementations/schema';

export const updateOneDraftSchema = Schema.object({
  password: Schema.notEmptyString().optional(),
  email: Schema.notEmptyString().optional(),
  phoneNumber: Schema.notEmptyString().optional(),
});

export type UpdateOneDraft = SchemaType<typeof updateOneDraftSchema>;
