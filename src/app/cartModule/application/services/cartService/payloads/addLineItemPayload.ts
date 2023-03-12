import { addLineItemDraftSchema } from './addLineItemDraft';
import { UnitOfWork } from '../../../../../../libs/unitOfWork/contracts/unitOfWork';
import { SchemaType } from '../../../../../../libs/validator/schemaType';
import { Schema } from '../../../../../../libs/validator/implementations/schema';

export const addLineItemPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  cartId: Schema.notEmptyString(),
  draft: addLineItemDraftSchema,
});

export type AddLineItemPayload = SchemaType<typeof addLineItemPayloadSchema>;
