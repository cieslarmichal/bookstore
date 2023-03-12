import { Schema } from '../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../libs/validator/schemaType';

export const createCartDraftSchema = Schema.object({
  customerId: Schema.notEmptyString(),
});

export type CreateCartDraft = SchemaType<typeof createCartDraftSchema>;
