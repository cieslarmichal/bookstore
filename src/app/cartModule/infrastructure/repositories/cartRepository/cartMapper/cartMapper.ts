import { Mapper } from '../../../../../../common/types/contracts/mapper';
import { Cart } from '../../../../domain/entities/cart/cart';
import { CartEntity } from '../cartEntity/cartEntity';

export type CartMapper = Mapper<CartEntity, Cart>;
