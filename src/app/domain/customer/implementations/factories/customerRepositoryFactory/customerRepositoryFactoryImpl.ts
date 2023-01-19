import { EntityManager } from 'typeorm';
import { CustomerRepositoryFactory } from '../../../contracts/factories/customerRepositoryFactory/customerRepositoryFactory';
import { CustomerMapper } from '../../../contracts/mappers/customerMapper/customerMapper';
import { CustomerRepository } from '../../../contracts/repositories/customerRepository/customerRepository';
import { CustomerRepositoryImpl } from '../../repositories/customerRepository/customerRepositoryImpl';

export class CustomerRepositoryFactoryImpl implements CustomerRepositoryFactory {
  public constructor(private readonly customerMapper: CustomerMapper) {}

  public create(entityManager: EntityManager): CustomerRepository {
    return new CustomerRepositoryImpl(entityManager, this.customerMapper);
  }
}
