import { Inject, Injectable } from '../../../../../../libs/dependencyInjection/contracts/decorators';
import { LineItemMapper } from '../../../../lineItemModule/infrastructure/repositories/lineItemRepository/lineItemMapper/lineItemMapper';
import { lineItemModuleSymbols } from '../../../../lineItemModule/lineItemModuleSymbols';
import { Cart } from '../../../contracts/cart';
import { CartEntity } from '../../../contracts/cartEntity';
import { CartMapper } from '../../../contracts/mappers/cartMapper/cartMapper';

@Injectable()
export class CartMapperImpl implements CartMapper {
  public constructor(
    @Inject(lineItemModuleSymbols.lineItemMapper)
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
