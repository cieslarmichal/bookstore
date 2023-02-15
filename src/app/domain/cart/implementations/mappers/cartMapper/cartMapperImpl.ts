import { Injectable } from '../../../../../libs/dependencyInjection/contracts/decorators';
import { Cart } from '../../../contracts/cart';
import { CartEntity } from '../../../contracts/cartEntity';
import { CartMapper } from '../../../contracts/mappers/cartMapper/cartMapper';

@Injectable()
export class CartMapperImpl implements CartMapper {
  public map({
    id,
    customerId,
    status,
    totalPrice,
    deliveryMethod,
    billingAddressId,
    shippingAddressId,
  }: CartEntity): Cart {
    return new Cart({
      id,
      customerId,
      status,
      totalPrice,
      deliveryMethod: deliveryMethod || undefined,
      billingAddressId: billingAddressId || undefined,
      shippingAddressId: shippingAddressId || undefined,
    });
  }
}
