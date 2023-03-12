import { CartMapper } from './cartMapper';
import { Inject, Injectable } from '../../../../../../libs/dependencyInjection/decorators';
import { LineItemMapper } from '../../../../../lineItemModule/infrastructure/repositories/lineItemRepository/lineItemMapper/lineItemMapper';
import { Cart } from '../../../../../orderModule/domain/entities/cart/cart';
import { CartEntity } from '../cartEntity/cartEntity';

@Injectable()
export class CartMapperImpl implements CartMapper {
  public constructor(
    @Inject(lineItemSymbols.lineItemMapper)
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
