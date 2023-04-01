import { Mapper } from '../../../../../../../common/types/mapper';
import { Cart } from '../../../../../orderModule/domain/entities/cart/cart';
import { CartEntity } from '../cartEntity/cartEntity';

export type CartMapper = Mapper<CartEntity, Cart>;
