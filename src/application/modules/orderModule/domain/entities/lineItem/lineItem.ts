import { Schema } from '../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../libs/validator/schemaType';
import { Validator } from '../../../../../../libs/validator/validator';

export const lineItemInputSchema = Schema.object({
  id: Schema.string(),
  quantity: Schema.integer(),
  price: Schema.number(),
  totalPrice: Schema.number(),
  bookId: Schema.string(),
  cartId: Schema.string(),
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
    const { id, quantity, price, totalPrice, bookId, cartId } = Validator.validate(lineItemInputSchema, input);

    this.id = id;
    this.quantity = quantity;
    this.price = price;
    this.totalPrice = totalPrice;
    this.bookId = bookId;
    this.cartId = cartId;
  }
}
