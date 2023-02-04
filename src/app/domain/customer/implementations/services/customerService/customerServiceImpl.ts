import { LoggerService } from '../../../../../libs/logger/contracts/services/loggerService/loggerService';
import { UuidGenerator } from '../../../../../libs/uuid/uuidGenerator';
import { Customer } from '../../../contracts/customer';
import { CustomerRepositoryFactory } from '../../../contracts/factories/customerRepositoryFactory/customerRepositoryFactory';
import { FindOnePayload } from '../../../contracts/repositories/customerRepository/findOnePayload';
import { CreateCustomerPayload } from '../../../contracts/services/customerService/createCustomerPayload';
import { CustomerService } from '../../../contracts/services/customerService/customerService';
import { DeleteCustomerPayload } from '../../../contracts/services/customerService/deleteCustomerPayload';
import { FindCustomerPayload } from '../../../contracts/services/customerService/findCustomerPayload';
import { CustomerAlreadyExistsError } from '../../../errors/customerAlreadyExistsError';
import { CustomerNotFoundError } from '../../../errors/customerNotFoundError';

export class CustomerServiceImpl implements CustomerService {
  public constructor(
    private readonly customerRepositoryFactory: CustomerRepositoryFactory,
    private readonly loggerService: LoggerService,
  ) {}

  public async createCustomer(input: CreateCustomerPayload): Promise<Customer> {
    const {
      unitOfWork,
      draft: { userId },
    } = input;

    this.loggerService.debug({ message: 'Creating customer...', context: { userId } });

    const { entityManager } = unitOfWork;

    const customerRepository = this.customerRepositoryFactory.create(entityManager);

    const existingCustomer = await customerRepository.findOne({ userId });

    if (existingCustomer) {
      throw new CustomerAlreadyExistsError({ userId });
    }

    const customer = await customerRepository.createOne({ id: UuidGenerator.generateUuid(), userId });

    this.loggerService.info({ message: 'Customer created.', context: { customerId: customer.id } });

    return customer;
  }

  public async findCustomer(input: FindCustomerPayload): Promise<Customer> {
    const { unitOfWork, customerId, userId } = input;

    const { entityManager } = unitOfWork;

    const customerRepository = this.customerRepositoryFactory.create(entityManager);

    let findOnePayload: FindOnePayload = {};

    if (customerId) {
      findOnePayload = { ...findOnePayload, id: customerId };
    }

    if (userId) {
      findOnePayload = { ...findOnePayload, userId };
    }

    const customer = await customerRepository.findOne(findOnePayload);

    if (!customer) {
      throw new CustomerNotFoundError({ ...findOnePayload });
    }

    return customer;
  }

  public async deleteCustomer(input: DeleteCustomerPayload): Promise<void> {
    const { unitOfWork, customerId } = input;

    this.loggerService.debug({ message: 'Deleting customer...', context: { customerId } });

    const { entityManager } = unitOfWork;

    const customerRepository = this.customerRepositoryFactory.create(entityManager);

    await customerRepository.deleteOne({ id: customerId });

    this.loggerService.info({ message: 'Customer deleted.', context: { customerId } });
  }
}
