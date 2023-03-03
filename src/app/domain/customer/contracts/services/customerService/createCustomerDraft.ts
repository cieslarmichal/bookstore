import { SchemaType } from '../../../../../libs/validator/contracts/schemaType';
import { Schema } from '../../../../../libs/validator/implementations/schema';

export const createCustomerDraftSchema = Schema.object({
  userId: Schema.notEmptyString(),
});

export type CreateCustomerDraft = SchemaType<typeof createCustomerDraftSchema>;
