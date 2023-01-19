import { PostgresUnitOfWork } from '../../../common';
import { LoggerService } from '../../../common/logger/services/loggerService';
import { CustomerDto } from '../dtos';
import { CustomerAlreadyExists, CustomerNotFound } from '../errors';
import { CustomerRepositoryFactory } from '../repositories/customerRepositoryFactory';
import { CreateCustomerData, FindCustomerData } from './types';

export class CustomerService {
  public constructor(
    private readonly customerRepositoryFactory: CustomerRepositoryFactory,
    private readonly loggerService: LoggerService,
  ) {}

  public async createCustomer(unitOfWork: PostgresUnitOfWork, customerData: CreateCustomerData): Promise<CustomerDto> {
    const { userId } = customerData;

    this.loggerService.debug('Creating customer...', { userId });

    const { entityManager } = unitOfWork;

    const customerRepository = this.customerRepositoryFactory.create(entityManager);

    const existingCustomer = await customerRepository.findOne({ userId });

    if (existingCustomer) {
      throw new CustomerAlreadyExists({ userId });
    }

    const customer = await customerRepository.createOne(customerData);

    this.loggerService.info('Customer created.', { customerId: customer.id });

    return customer;
  }

  public async findCustomer(unitOfWork: PostgresUnitOfWork, customerData: FindCustomerData): Promise<CustomerDto> {
    const { entityManager } = unitOfWork;

    const customerRepository = this.customerRepositoryFactory.create(entityManager);

    const customer = await customerRepository.findOne(customerData);

    if (!customer) {
      throw new CustomerNotFound({ ...customerData });
    }

    return customer;
  }

  public async removeCustomer(unitOfWork: PostgresUnitOfWork, customerId: string): Promise<void> {
    this.loggerService.debug('Removing customer...', { customerId });

    const { entityManager } = unitOfWork;

    const customerRepository = this.customerRepositoryFactory.create(entityManager);

    await customerRepository.removeOne(customerId);

    this.loggerService.info('Customer removed.', { customerId });
  }
}
