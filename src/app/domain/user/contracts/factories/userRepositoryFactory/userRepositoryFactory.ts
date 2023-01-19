import { EntityManager } from 'typeorm';
import { UserRepository } from '../../repositories/userRepository/userRepository';

export interface UserRepositoryFactory {
  create(entityManager: EntityManager): UserRepository;
}
