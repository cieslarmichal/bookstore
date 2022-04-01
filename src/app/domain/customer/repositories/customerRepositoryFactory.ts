import { EntityManager } from 'typeorm';
import { CustomerMapper } from '../mappers/customerMapper';
import { CustomerRepository } from './customerRepository';

export class CustomerRepositoryFactory {
  public constructor(private readonly customerMapper: CustomerMapper) {}

  public create(entityManager: EntityManager): CustomerRepository {
    return new CustomerRepository(entityManager, this.customerMapper);
  }
}
