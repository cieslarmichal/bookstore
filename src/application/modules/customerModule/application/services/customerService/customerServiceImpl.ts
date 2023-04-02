import { CustomerService } from './customerService';
import { CreateCustomerPayload, createCustomerPayloadSchema } from './payloads/createCustomerPayload';
import { DeleteCustomerPayload, deleteCustomerPayloadSchema } from './payloads/deleteCustomerPayload';
import { FindCustomerPayload, findCustomerPayloadSchema } from './payloads/findCustomerPayload';
import { Injectable, Inject } from '../../../../../../libs/dependencyInjection/decorators';
import { loggerModuleSymbols } from '../../../../../../libs/logger/loggerModuleSymbols';
import { LoggerService } from '../../../../../../libs/logger/services/loggerService/loggerService';
import { UuidGenerator } from '../../../../../../libs/uuid/uuidGenerator';
import { Validator } from '../../../../../../libs/validator/validator';
import { customerModuleSymbols } from '../../../customerModuleSymbols';
import { Customer } from '../../../domain/entities/customer/customer';
import { CustomerAlreadyExistsError } from '../../../infrastructure/errors/customerAlreadyExistsError';
import { CustomerNotFoundError } from '../../../infrastructure/errors/customerNotFoundError';
import { CustomerRepositoryFactory } from '../../repositories/customerRepository/customerRepositoryFactory';

@Injectable()
export class CustomerServiceImpl implements CustomerService {
  public constructor(
    @Inject(customerModuleSymbols.customerRepositoryFactory)
    private readonly customerRepositoryFactory: CustomerRepositoryFactory,
    @Inject(loggerModuleSymbols.loggerService)
    private readonly loggerService: LoggerService,
  ) {}

  public async createCustomer(input: CreateCustomerPayload): Promise<Customer> {
    const {
      unitOfWork,
      draft: { userId },
    } = Validator.validate(createCustomerPayloadSchema, input);

    this.loggerService.debug({ message: 'Creating customer...', context: { userId } });

    const entityManager = unitOfWork.getEntityManager();

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
    const { unitOfWork, customerId, userId } = Validator.validate(findCustomerPayloadSchema, input);

    const entityManager = unitOfWork.getEntityManager();

    const customerRepository = this.customerRepositoryFactory.create(entityManager);

    let findOnePayload = {};

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
    const { unitOfWork, customerId } = Validator.validate(deleteCustomerPayloadSchema, input);

    this.loggerService.debug({ message: 'Deleting customer...', context: { customerId } });

    const entityManager = unitOfWork.getEntityManager();

    const customerRepository = this.customerRepositoryFactory.create(entityManager);

    await customerRepository.deleteOne({ id: customerId });

    this.loggerService.info({ message: 'Customer deleted.', context: { customerId } });
  }
}
