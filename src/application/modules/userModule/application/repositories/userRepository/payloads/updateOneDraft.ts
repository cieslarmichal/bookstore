import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const updateOneDraftSchema = Schema.object({
  password: Schema.string().optional(),
  email: Schema.string().optional(),
  phoneNumber: Schema.string().optional(),
});

export type UpdateOneDraft = SchemaType<typeof updateOneDraftSchema>;
