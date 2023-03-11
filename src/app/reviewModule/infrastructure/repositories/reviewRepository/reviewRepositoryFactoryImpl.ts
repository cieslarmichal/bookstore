import { EntityManager } from 'typeorm';

import { ReviewMapper } from './reviewMapper/reviewMapper';
import { Injectable, Inject } from '../../../../../libs/dependencyInjection/contracts/decorators';
import { ReviewRepository } from '../../../application/repositories/reviewRepository/reviewRepository';
import { ReviewRepositoryFactory } from '../../../application/repositories/reviewRepository/reviewRepositoryFactory';
import { ReviewRepositoryImpl } from '../../../infrastructure/repositories/reviewRepository/reviewRepositoryImpl';
import { reviewModuleSymbols } from '../../../reviewModuleSymbols';

@Injectable()
export class ReviewRepositoryFactoryImpl implements ReviewRepositoryFactory {
  public constructor(
    @Inject(reviewModuleSymbols.reviewMapper)
    private readonly reviewMapper: ReviewMapper,
  ) {}

  public create(entityManager: EntityManager): ReviewRepository {
    return new ReviewRepositoryImpl(entityManager, this.reviewMapper);
  }
}
