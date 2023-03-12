import 'reflect-metadata';

import { ReviewMapperImpl } from './reviewMapperImpl';
import { ReviewEntityTestFactory } from '../../../../tests/factories/reviewEntityTestFactory/reviewEntityTestFactory';

describe('ReviewMapperImpl', () => {
  let reviewMapperImpl: ReviewMapperImpl;

  const reviewEntityTestFactory = new ReviewEntityTestFactory();

  beforeAll(async () => {
    reviewMapperImpl = new ReviewMapperImpl();
  });

  it('maps a review entity to a review', async () => {
    expect.assertions(1);

    const reviewEntity = reviewEntityTestFactory.create();

    const review = reviewMapperImpl.map(reviewEntity);

    expect(review).toEqual({
      id: reviewEntity.id,
      isbn: reviewEntity.isbn,
      rate: reviewEntity.rate,
      comment: reviewEntity.comment,
      customerId: reviewEntity.customerId,
    });
  });
});
