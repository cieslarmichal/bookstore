import { SchemaType } from '../../../../../../libs/validator/contracts/schemaType';
import { Schema } from '../../../../../../libs/validator/implementations/schema';

export const createCartDraftSchema = Schema.object({
  customerId: Schema.notEmptyString(),
});

export type CreateCartDraft = SchemaType<typeof createCartDraftSchema>;
