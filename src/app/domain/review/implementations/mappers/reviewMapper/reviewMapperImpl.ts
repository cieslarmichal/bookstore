import { Injectable } from '../../../../../../libs/dependencyInjection/contracts/decorators';
import { ReviewMapper } from '../../../contracts/mappers/reviewMapper/reviewMapper';
import { Review } from '../../../contracts/review';
import { ReviewEntity } from '../../../contracts/reviewEntity';

@Injectable()
export class ReviewMapperImpl implements ReviewMapper {
  public map({ id, isbn, rate, comment, customerId }: ReviewEntity): Review {
    return new Review({
      id,
      isbn,
      rate,
      comment: comment || undefined,
      customerId,
    });
  }
}
