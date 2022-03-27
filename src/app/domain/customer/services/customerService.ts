import { LoggerService } from '../../../shared/logger/services/loggerService';
import { CustomerDto } from '../dtos';
import { CustomerAlreadyExists, CustomerNotFound } from '../errors';
import { CustomerRepository } from '../repositories/customerRepository';
import { CreateCustomerData, FindCustomerData } from './types';

export class CustomerService {
  public constructor(
    private readonly customerRepository: CustomerRepository,
    private readonly loggerService: LoggerService,
  ) {}

  public async createCustomer(customerData: CreateCustomerData): Promise<CustomerDto> {
    const { userId } = customerData;

    this.loggerService.debug('Creating customer...', { userId });

    const existingCustomer = await this.customerRepository.findOne({ userId });

    if (existingCustomer) {
      throw new CustomerAlreadyExists({ userId });
    }

    const customer = await this.customerRepository.createOne(customerData);

    this.loggerService.info('Customer created.', { customerId: customer.id });

    return customer;
  }

  public async findCustomer(customerData: FindCustomerData): Promise<CustomerDto> {
    const customer = await this.customerRepository.findOne(customerData);

    if (!customer) {
      throw new CustomerNotFound({ ...customerData });
    }

    return customer;
  }

  public async removeCustomer(customerId: string): Promise<void> {
    this.loggerService.debug('Removing customer...', { customerId });

    await this.customerRepository.removeOne(customerId);

    this.loggerService.info('Customer removed.', { customerId });
  }
}
