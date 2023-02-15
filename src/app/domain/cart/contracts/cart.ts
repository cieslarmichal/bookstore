import { CartStatus } from './cartStatus';
import { DeliveryMethod } from './deliveryMethod';
import { SchemaType } from '../../../common/validator/contracts/schemaType';
import { PayloadFactory } from '../../../common/validator/implementations/payloadFactory';
import { Schema } from '../../../common/validator/implementations/schema';

export const cartInputSchema = Schema.object({
  id: Schema.notEmptyString(),
  customerId: Schema.notEmptyString(),
  status: Schema.enum(CartStatus),
  totalPrice: Schema.number(),
  billingAddressId: Schema.notEmptyString().optional(),
  shippingAddressId: Schema.notEmptyString().optional(),
  deliveryMethod: Schema.enum(DeliveryMethod).optional(),
});

export type CartInput = SchemaType<typeof cartInputSchema>;

export class Cart {
  public readonly id: string;
  public readonly customerId: string;
  public readonly status: CartStatus;
  public readonly totalPrice: number;
  public readonly billingAddressId?: string;
  public readonly shippingAddressId?: string;
  public readonly deliveryMethod?: DeliveryMethod;

  public constructor(input: CartInput) {
    const { id, customerId, status, totalPrice, billingAddressId, shippingAddressId, deliveryMethod } =
      PayloadFactory.create(cartInputSchema, input);

    this.id = id;
    this.customerId = customerId;
    this.status = status;
    this.totalPrice = totalPrice;

    if (billingAddressId) {
      this.billingAddressId = billingAddressId;
    }

    if (shippingAddressId) {
      this.shippingAddressId = shippingAddressId;
    }

    if (deliveryMethod) {
      this.deliveryMethod = deliveryMethod;
    }
  }
}
