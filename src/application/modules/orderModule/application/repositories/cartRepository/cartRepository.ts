import { CreateCartPayload } from './payloads/createCartPayload';
import { DeleteCartPayload } from './payloads/deleteCartPayload';
import { FindCartPayload } from './payloads/findCartPayload';
import { FindCartsPayload } from './payloads/findCartsPayload';
import { UpdateCartPayload } from './payloads/updateCartPayload';
import { Cart } from '../../../domain/entities/cart/cart';

export interface CartRepository {
  createCart(input: CreateCartPayload): Promise<Cart>;
  findCart(input: FindCartPayload): Promise<Cart | null>;
  findCarts(input: FindCartsPayload): Promise<Cart[]>;
  deleteCart(input: DeleteCartPayload): Promise<void>;
  updateCart(input: UpdateCartPayload): Promise<Cart>;
}
