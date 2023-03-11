import { EntityManager } from 'typeorm';

import { AuthorRepository } from '../../repositories/authorRepository/authorRepository';

export interface AuthorRepositoryFactory {
  create(entityManager: EntityManager): AuthorRepository;
}
