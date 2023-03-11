import { ReviewMapper } from './reviewMapper';
import { Injectable } from '../../../../../../libs/dependencyInjection/contracts/decorators';
import { Review } from '../../../../domain/entities/review/review';
import { ReviewEntity } from '../reviewEntity/reviewEntity';

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
