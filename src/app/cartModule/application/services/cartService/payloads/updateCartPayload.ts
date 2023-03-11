import { updateCartDraftSchema } from './updateCartDraft';
import { UnitOfWork } from '../../../../../../libs/unitOfWork/contracts/unitOfWork';
import { SchemaType } from '../../../../../../libs/validator/contracts/schemaType';
import { Schema } from '../../../../../../libs/validator/implementations/schema';

export const updateCartPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  cartId: Schema.notEmptyString(),
  draft: updateCartDraftSchema,
});

export type UpdateCartPayload = SchemaType<typeof updateCartPayloadSchema>;
