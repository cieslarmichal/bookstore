import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const updateOneDraftSchema = Schema.object({
  about: Schema.string(),
});

export type UpdateOneDraft = SchemaType<typeof updateOneDraftSchema>;
