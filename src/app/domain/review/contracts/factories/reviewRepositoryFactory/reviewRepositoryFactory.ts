import { EntityManager } from 'typeorm';

import { ReviewRepository } from '../../repositories/reviewRepository/reviewRepository';

export interface ReviewRepositoryFactory {
  create(entityManager: EntityManager): ReviewRepository;
}
