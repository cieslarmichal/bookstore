import { CreateCartPayload } from './createCartPayload';
import { DeleteCartPayload } from './deleteCartPayload';
import { FindCartPayload } from './findCartPayload';
import { UpdateCartPayload } from './updateCartPayload';
import { Cart } from '../../cart';

export interface CartService {
  createCart(input: CreateCartPayload): Promise<Cart>;
  findCart(input: FindCartPayload): Promise<Cart>;
  updateCart(input: UpdateCartPayload): Promise<Cart>;
  deleteCart(input: DeleteCartPayload): Promise<void>;
}
