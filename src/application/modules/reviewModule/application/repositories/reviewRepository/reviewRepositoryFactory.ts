import { EntityManager } from 'typeorm';

import { ReviewRepository } from './reviewRepository';

export interface ReviewRepositoryFactory {
  create(entityManager: EntityManager): ReviewRepository;
}
