import { SchemaType } from '../../../../../common/validator/contracts/schemaType';
import { Schema } from '../../../../../common/validator/implementations/schema';

export const createCustomerDraftSchema = Schema.object({
  userId: Schema.notEmptyString(),
});

export type CreateCustomerDraft = SchemaType<typeof createCustomerDraftSchema>;
