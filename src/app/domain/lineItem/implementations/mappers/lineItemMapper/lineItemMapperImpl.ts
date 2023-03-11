import { Injectable } from '../../../../../../libs/dependencyInjection/contracts/decorators';
import { LineItem } from '../../../contracts/lineItem';
import { LineItemEntity } from '../../../contracts/lineItemEntity';
import { LineItemMapper } from '../../../contracts/mappers/lineItemMapper/lineItemMapper';

@Injectable()
export class LineItemMapperImpl implements LineItemMapper {
  public map({ id, quantity, price, totalPrice, bookId, cartId }: LineItemEntity): LineItem {
    return new LineItem({
      id,
      quantity,
      price,
      totalPrice,
      bookId,
      cartId,
    });
  }
}
