import { removeLineItemDraftSchema } from './removeLineItemDraft';
import { UnitOfWork } from '../../../../../../../libs/unitOfWork/unitOfWork';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const removeLineItemPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  cartId: Schema.notEmptyString(),
  draft: removeLineItemDraftSchema,
});

export type RemoveLineItemPayload = SchemaType<typeof removeLineItemPayloadSchema>;
