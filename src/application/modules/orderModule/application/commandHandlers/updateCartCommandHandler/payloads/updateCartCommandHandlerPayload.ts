import { updateCartDraftSchema } from './updateCartDraft';
import { UnitOfWork } from '../../../../../../../libs/unitOfWork/unitOfWork';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const updateCartCommandHandlerPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  cartId: Schema.string(),
  draft: updateCartDraftSchema,
});

export type UpdateCartCommandHandlerPayload = SchemaType<typeof updateCartCommandHandlerPayloadSchema>;
