import { EntityManager } from 'typeorm';

import { CustomerMapper } from './customerMapper/customerMapper';
import { Injectable, Inject } from '../../../../../libs/dependencyInjection/decorators';
import { CustomerRepository } from '../../../application/repositories/customerRepository/customerRepository';
import { CustomerRepositoryFactory } from '../../../application/repositories/customerRepository/customerRepositoryFactory';
import { customerSymbols } from '../../../symbols';
import { CustomerRepositoryImpl } from '../../repositories/customerRepository/customerRepositoryImpl';

@Injectable()
export class CustomerRepositoryFactoryImpl implements CustomerRepositoryFactory {
  public constructor(
    @Inject(customerSymbols.customerMapper)
    private readonly customerMapper: CustomerMapper,
  ) {}

  public create(entityManager: EntityManager): CustomerRepository {
    return new CustomerRepositoryImpl(entityManager, this.customerMapper);
  }
}
