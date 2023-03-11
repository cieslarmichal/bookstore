import { LineItemMapper } from './lineItemMapper';
import { Injectable } from '../../../../../../libs/dependencyInjection/contracts/decorators';
import { LineItem } from '../../../../domain/entities/lineItem/lineItem';
import { LineItemEntity } from '../lineItemEntity/lineItemEntity';

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
