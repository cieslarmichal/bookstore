import { CartStatus } from './cartStatus';
import { DeliveryMethod } from './deliveryMethod';
import { Schema } from '../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../libs/validator/schemaType';
import { Validator } from '../../../../../../libs/validator/validator';
import { LineItem } from '../lineItem/lineItem';

export const cartInputSchema = Schema.object({
  id: Schema.string(),
  customerId: Schema.string(),
  status: Schema.enum(CartStatus),
  totalPrice: Schema.number(),
  billingAddressId: Schema.string().optional(),
  shippingAddressId: Schema.string().optional(),
  deliveryMethod: Schema.enum(DeliveryMethod).optional(),
  lineItems: Schema.array(Schema.instanceof(LineItem)).optional(),
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
  public readonly lineItems?: LineItem[];

  public constructor(input: CartInput) {
    const { id, customerId, status, totalPrice, billingAddressId, shippingAddressId, deliveryMethod, lineItems } =
      Validator.validate(cartInputSchema, input);

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

    if (lineItems) {
      this.lineItems = lineItems;
    }
  }
}
