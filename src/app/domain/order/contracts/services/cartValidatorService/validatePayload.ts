import { UnitOfWork } from '../../../../../libs/unitOfWork/contracts/unitOfWork';
import { SchemaType } from '../../../../../libs/validator/contracts/schemaType';
import { Schema } from '../../../../../libs/validator/implementations/schema';
import { Cart } from '../../../../cart/contracts/cart';

export const validatePayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  cart: Schema.instanceof(Cart),
  orderCreatorId: Schema.notEmptyString(),
});

export type ValidatePayload = SchemaType<typeof validatePayloadSchema>;
