import { EntityManager } from 'typeorm';

import { CustomerRepository } from './customerRepository';

export interface CustomerRepositoryFactory {
  create(entityManager: EntityManager): CustomerRepository;
}
