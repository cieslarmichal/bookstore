import { SchemaType } from '../../../../../common/validator/contracts/schemaType';
import { Schema } from '../../../../../common/validator/implementations/schema';

export const createCartDraftSchema = Schema.object({
  customerId: Schema.notEmptyString(),
});

export type CreateCartDraft = SchemaType<typeof createCartDraftSchema>;
