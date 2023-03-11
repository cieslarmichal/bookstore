import { SchemaType } from '../../../../libs/validator/contracts/schemaType';
import { Schema } from '../../../../libs/validator/implementations/schema';
import { Validator } from '../../../../libs/validator/implementations/validator';

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
    const { id, quantity, price, totalPrice, bookId, cartId } = Validator.validate(lineItemInputSchema, input);

    this.id = id;
    this.quantity = quantity;
    this.price = price;
    this.totalPrice = totalPrice;
    this.bookId = bookId;
    this.cartId = cartId;
  }
}
