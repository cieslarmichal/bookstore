import { EntityManager } from 'typeorm';

import { WhishlistEntryRepository } from './whishlistEntryRepository';

export interface WhishlistEntryRepositoryFactory {
  create(entityManager: EntityManager): WhishlistEntryRepository;
}
