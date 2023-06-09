import { EntityManager } from 'typeorm';

import { ReviewMapper } from './reviewMapper/reviewMapper';
import { Injectable, Inject } from '../../../../../../libs/dependencyInjection/decorators';
import { ReviewRepository } from '../../../application/repositories/reviewRepository/reviewRepository';
import { ReviewRepositoryFactory } from '../../../application/repositories/reviewRepository/reviewRepositoryFactory';
import { ReviewRepositoryImpl } from '../../../infrastructure/repositories/reviewRepository/reviewRepositoryImpl';
import { symbols } from '../../../symbols';

@Injectable()
export class ReviewRepositoryFactoryImpl implements ReviewRepositoryFactory {
  public constructor(
    @Inject(symbols.reviewMapper)
    private readonly reviewMapper: ReviewMapper,
  ) {}

  public create(entityManager: EntityManager): ReviewRepository {
    return new ReviewRepositoryImpl(entityManager, this.reviewMapper);
  }
}
