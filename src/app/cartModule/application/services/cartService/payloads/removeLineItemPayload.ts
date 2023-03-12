import { removeLineItemDraftSchema } from './removeLineItemDraft';
import { UnitOfWork } from '../../../../../../libs/unitOfWork/contracts/unitOfWork';
import { SchemaType } from '../../../../../../libs/validator/schemaType';
import { Schema } from '../../../../../../libs/validator/implementations/schema';

export const removeLineItemPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  cartId: Schema.notEmptyString(),
  draft: removeLineItemDraftSchema,
});

export type RemoveLineItemPayload = SchemaType<typeof removeLineItemPayloadSchema>;
