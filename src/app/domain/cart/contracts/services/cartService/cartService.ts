import { AddLineItemPayload } from './addLineItemPayload';
import { CreateCartPayload } from './createCartPayload';
import { DeleteCartPayload } from './deleteCartPayload';
import { FindCartPayload } from './findCartPayload';
import { RemoveLineItemPayload } from './removeLineItemPayload';
import { UpdateCartPayload } from './updateCartPayload';
import { Cart } from '../../cart';

export interface CartService {
  createCart(input: CreateCartPayload): Promise<Cart>;
  findCart(input: FindCartPayload): Promise<Cart>;
  updateCart(input: UpdateCartPayload): Promise<Cart>;
  addLineItem(input: AddLineItemPayload): Promise<Cart>;
  removeLineItem(input: RemoveLineItemPayload): Promise<Cart>;
  deleteCart(input: DeleteCartPayload): Promise<void>;
}
