import { EntityManager } from 'typeorm';

import { Injectable, Inject } from '../../../../../libs/dependencyInjection/contracts/decorators';
import { CustomerRepositoryFactory } from '../../../contracts/factories/customerRepositoryFactory/customerRepositoryFactory';
import { CustomerMapper } from '../../../contracts/mappers/customerMapper/customerMapper';
import { CustomerRepository } from '../../../contracts/repositories/customerRepository/customerRepository';
import { customerSymbols } from '../../../customerSymbols';
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
