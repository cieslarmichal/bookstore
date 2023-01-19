import { EntityManager } from 'typeorm';
import { AuthorBookRepository } from '../../repositories/authorBookRepository/authorBookRepository';

export interface AuthorBookRepositoryFactory {
  create(entityManager: EntityManager): AuthorBookRepository;
}
