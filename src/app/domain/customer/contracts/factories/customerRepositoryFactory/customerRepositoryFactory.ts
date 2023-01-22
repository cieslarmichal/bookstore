import { EntityManager } from 'typeorm';

import { CustomerRepository } from '../../repositories/customerRepository/customerRepository';

export interface CustomerRepositoryFactory {
  create(entityManager: EntityManager): CustomerRepository;
}
