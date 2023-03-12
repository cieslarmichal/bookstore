import { Schema } from '../../../../../../libs/validator/implementations/schema';
import { SchemaType } from '../../../../../../libs/validator/schemaType';

export const createCustomerDraftSchema = Schema.object({
  userId: Schema.notEmptyString(),
});

export type CreateCustomerDraft = SchemaType<typeof createCustomerDraftSchema>;
