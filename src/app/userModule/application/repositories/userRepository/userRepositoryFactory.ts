import { EntityManager } from 'typeorm';

import { UserRepository } from './userRepository';

export interface UserRepositoryFactory {
  create(entityManager: EntityManager): UserRepository;
}
