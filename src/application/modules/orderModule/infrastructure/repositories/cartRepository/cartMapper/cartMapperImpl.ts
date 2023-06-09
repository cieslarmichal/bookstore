import { CartMapper } from './cartMapper';
import { Injectable, Inject } from '../../../../../../../libs/dependencyInjection/decorators';
import { Cart } from '../../../../../orderModule/domain/entities/cart/cart';
import { symbols } from '../../../../symbols';
import { LineItemMapper } from '../../lineItemRepository/lineItemMapper/lineItemMapper';
import { CartEntity } from '../cartEntity/cartEntity';

@Injectable()
export class CartMapperImpl implements CartMapper {
  public constructor(
    @Inject(symbols.lineItemMapper)
    private readonly lineItemMapper: LineItemMapper,
  ) {}

  public map({
    id,
    customerId,
    status,
    totalPrice,
    deliveryMethod,
    billingAddressId,
    shippingAddressId,
    lineItems: lineItemsEntities,
  }: CartEntity): Cart {
    const lineItems = lineItemsEntities?.map((lineItemEntity) => this.lineItemMapper.map(lineItemEntity));

    return new Cart({
      id,
      customerId,
      status,
      totalPrice,
      deliveryMethod: deliveryMethod || undefined,
      billingAddressId: billingAddressId || undefined,
      shippingAddressId: shippingAddressId || undefined,
      lineItems,
    });
  }
}
