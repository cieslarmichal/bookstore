import { updateCartDraftSchema } from './updateCartDraft';
import { UnitOfWork } from '../../../../../../../libs/unitOfWork/unitOfWork';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const updateCartPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  cartId: Schema.string(),
  draft: updateCartDraftSchema,
});

export type UpdateCartPayload = SchemaType<typeof updateCartPayloadSchema>;
