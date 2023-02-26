import { SchemaType } from '../../../../../common/validator/contracts/schemaType';
import { Schema } from '../../../../../common/validator/implementations/schema';
import { UnitOfWork } from '../../../../../libs/unitOfWork/contracts/unitOfWork';
import { Cart } from '../../../../cart/contracts/cart';

export const validatePayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  cart: Schema.instanceof(Cart),
  orderCreatorId: Schema.notEmptyString(),
});

export type ValidatePayload = SchemaType<typeof validatePayloadSchema>;
