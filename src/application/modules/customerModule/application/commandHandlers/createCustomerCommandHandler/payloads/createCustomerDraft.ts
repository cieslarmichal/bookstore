import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const createCustomerDraftSchema = Schema.object({
  userId: Schema.string(),
});

export type CreateCustomerDraft = SchemaType<typeof createCustomerDraftSchema>;
