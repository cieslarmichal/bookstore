import { Injectable, Inject } from '../../../../../libs/dependencyInjection/contracts/decorators';
import { LoggerService } from '../../../../../libs/logger/contracts/services/loggerService/loggerService';
import { loggerSymbols } from '../../../../../libs/logger/loggerSymbols';
import { UuidGenerator } from '../../../../../libs/uuid/implementations/uuidGenerator';
import { Validator } from '../../../../../libs/validator/implementations/validator';
import { Customer } from '../../../contracts/customer';
import { CustomerRepositoryFactory } from '../../../contracts/factories/customerRepositoryFactory/customerRepositoryFactory';
import {
  CreateCustomerPayload,
  createCustomerPayloadSchema,
} from '../../../contracts/services/customerService/createCustomerPayload';
import { CustomerService } from '../../../contracts/services/customerService/customerService';
import {
  DeleteCustomerPayload,
  deleteCustomerPayloadSchema,
} from '../../../contracts/services/customerService/deleteCustomerPayload';
import {
  FindCustomerPayload,
  findCustomerPayloadSchema,
} from '../../../contracts/services/customerService/findCustomerPayload';
import { customerSymbols } from '../../../customerSymbols';
import { CustomerAlreadyExistsError } from '../../../errors/customerAlreadyExistsError';
import { CustomerNotFoundError } from '../../../errors/customerNotFoundError';

@Injectable()
export class CustomerServiceImpl implements CustomerService {
  public constructor(
    @Inject(customerSymbols.customerRepositoryFactory)
    private readonly customerRepositoryFactory: CustomerRepositoryFactory,
    @Inject(loggerSymbols.loggerService)
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
