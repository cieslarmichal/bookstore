import { EntityManager } from 'typeorm';

import { WhishlistEntryRepository } from '../../repositories/whishlistEntryRepository/whishlistEntryRepository';

export interface ReviewRepositoryFactory {
  create(entityManager: EntityManager): WhishlistEntryRepository;
}
