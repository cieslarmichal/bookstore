import { EntityManager } from 'typeorm';

import { WhishlistEntryRepository } from '../../repositories/whishlistEntryRepository/whishlistEntryRepository';

export interface WhishlistEntryRepositoryFactory {
  create(entityManager: EntityManager): WhishlistEntryRepository;
}
