import { SchemaType } from '../../../common/validator/contracts/schemaType';
import { PayloadFactory } from '../../../common/validator/implementations/payloadFactory';
import { Schema } from '../../../common/validator/implementations/schema';

export const lineItemInputSchema = Schema.object({
  id: Schema.notEmptyString(),
  quantity: Schema.integer(),
  price: Schema.number(),
  totalPrice: Schema.number(),
  bookId: Schema.notEmptyString(),
  cartId: Schema.notEmptyString(),
});

export type LineItemInput = SchemaType<typeof lineItemInputSchema>;

export class LineItem {
  public readonly id: string;
  public readonly quantity: number;
  public readonly price: number;
  public readonly totalPrice: number;
  public readonly bookId: string;
  public readonly cartId: string;

  public constructor(input: LineItemInput) {
    const { id, quantity, price, totalPrice, bookId, cartId } = PayloadFactory.create(lineItemInputSchema, input);

    this.id = id;
    this.quantity = quantity;
    this.price = price;
    this.totalPrice = totalPrice;
    this.bookId = bookId;
    this.cartId = cartId;
  }
}
