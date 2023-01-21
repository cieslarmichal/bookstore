import { LoggerService } from '../../../../../libs/logger/loggerService';
import { PostgresUnitOfWork } from '../../../../../libs/unitOfWork/postgresUnitOfWork';
import { Customer } from '../../../contracts/customer';
import { CustomerRepositoryFactory } from '../../../contracts/factories/customerRepositoryFactory/customerRepositoryFactory';
import { CreateCustomerData } from '../../../contracts/services/customerService/createCustomerData';
import { CustomerService } from '../../../contracts/services/customerService/customerService';
import { FindCustomerData } from '../../../contracts/services/customerService/findCustomerData';
import { CustomerAlreadyExists } from '../../../errors/customerAlreadyExists';
import { CustomerNotFound } from '../../../errors/customerNotFound';

export class CustomerServiceImpl implements CustomerService {
  public constructor(
    private readonly customerRepositoryFactory: CustomerRepositoryFactory,
    private readonly loggerService: LoggerService,
  ) {}

  public async createCustomer(unitOfWork: PostgresUnitOfWork, customerData: CreateCustomerData): Promise<Customer> {
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

  public async findCustomer(unitOfWork: PostgresUnitOfWork, customerData: FindCustomerData): Promise<Customer> {
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
