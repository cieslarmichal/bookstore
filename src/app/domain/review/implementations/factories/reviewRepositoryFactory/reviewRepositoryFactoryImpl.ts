import { EntityManager } from 'typeorm';

import { Inject, Injectable } from '../../../../../../libs/dependencyInjection/contracts/decorators';
import { ReviewRepositoryFactory } from '../../../contracts/factories/reviewRepositoryFactory/reviewRepositoryFactory';
import { ReviewMapper } from '../../../contracts/mappers/reviewMapper/reviewMapper';
import { ReviewRepository } from '../../../contracts/repositories/reviewRepository/reviewRepository';
import { reviewSymbols } from '../../../reviewSymbols';
import { ReviewRepositoryImpl } from '../../repositories/reviewRepository/reviewRepositoryImpl';

@Injectable()
export class ReviewRepositoryFactoryImpl implements ReviewRepositoryFactory {
  public constructor(
    @Inject(reviewSymbols.reviewMapper)
    private readonly reviewMapper: ReviewMapper,
  ) {}

  public create(entityManager: EntityManager): ReviewRepository {
    return new ReviewRepositoryImpl(entityManager, this.reviewMapper);
  }
}
