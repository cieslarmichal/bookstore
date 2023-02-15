import { Mapper } from '../../../../../common/types/contracts/mapper';
import { Cart } from '../../cart';
import { CartEntity } from '../../cartEntity';

export type CartMapper = Mapper<CartEntity, Cart>;
