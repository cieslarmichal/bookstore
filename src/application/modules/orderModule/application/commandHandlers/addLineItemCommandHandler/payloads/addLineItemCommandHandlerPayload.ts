import { addLineItemDraftSchema } from './addLineItemDraft';
import { UnitOfWork } from '../../../../../../../libs/unitOfWork/unitOfWork';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const addLineItemCommandHandlerPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  cartId: Schema.string(),
  draft: addLineItemDraftSchema,
});

export type AddLineItemCommandHandlerPayload = SchemaType<typeof addLineItemCommandHandlerPayloadSchema>;
