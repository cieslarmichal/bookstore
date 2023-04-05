import { AddLineItemPayload } from './payloads/addLineItemPayload';
import { CreateCartPayload } from './payloads/createCartPayload';
import { DeleteCartPayload } from './payloads/deleteCartPayload';
import { FindCartPayload } from './payloads/findCartPayload';
import { FindCartsPayload } from './payloads/findCartsPayload';
import { RemoveLineItemPayload } from './payloads/removeLineItemPayload';
import { UpdateCartPayload } from './payloads/updateCartPayload';
import { Cart } from '../../../domain/entities/cart/cart';

export interface CartService {
  createCart(input: CreateCartPayload): Promise<Cart>;
  findCart(input: FindCartPayload): Promise<Cart>;
  findCarts(input: FindCartsPayload): Promise<Cart[]>;
  updateCart(input: UpdateCartPayload): Promise<Cart>;
  addLineItem(input: AddLineItemPayload): Promise<Cart>;
  removeLineItem(input: RemoveLineItemPayload): Promise<Cart>;
  deleteCart(input: DeleteCartPayload): Promise<void>;
}
