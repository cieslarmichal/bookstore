import { removeLineItemDraftSchema } from './removeLineItemDraft';
import { SchemaType } from '../../../../../common/validator/contracts/schemaType';
import { Schema } from '../../../../../common/validator/implementations/schema';
import { UnitOfWork } from '../../../../../libs/unitOfWork/contracts/unitOfWork';

export const removeLineItemPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  cartId: Schema.notEmptyString(),
  draft: removeLineItemDraftSchema,
});

export type RemoveLineItemPayload = SchemaType<typeof removeLineItemPayloadSchema>;
