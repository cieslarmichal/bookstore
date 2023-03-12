import { Schema } from '../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../libs/validator/schemaType';

export const updateOneDraftSchema = Schema.object({
  about: Schema.notEmptyString(),
});

export type UpdateOneDraft = SchemaType<typeof updateOneDraftSchema>;
