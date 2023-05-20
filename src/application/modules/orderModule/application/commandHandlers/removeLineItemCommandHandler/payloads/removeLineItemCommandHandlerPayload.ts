import { removeLineItemDraftSchema } from './removeLineItemDraft';
import { UnitOfWork } from '../../../../../../../libs/unitOfWork/unitOfWork';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const removeLineItemCommandHandlerPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  cartId: Schema.string(),
  draft: removeLineItemDraftSchema,
});

export type RemoveLineItemCommandHandlerPayload = SchemaType<typeof removeLineItemCommandHandlerPayloadSchema>;
