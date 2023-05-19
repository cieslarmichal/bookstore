import { CreateCustomerCommandHandler } from './createCustomerCommandHandler';
import {
  CreateCustomerCommandHandlerPayload,
  createCustomerCommandHandlerPayloadSchema,
} from './payloads/createCustomerCommandHandlerPayload';
import {
  CreateCustomerCommandHandlerResult,
  createCustomerCommandHandlerResultSchema,
} from './payloads/createCustomerCommandHandlerResult';
import { Injectable, Inject } from '../../../../../../libs/dependencyInjection/decorators';
import { loggerModuleSymbols } from '../../../../../../libs/logger/loggerModuleSymbols';
import { LoggerService } from '../../../../../../libs/logger/services/loggerService/loggerService';
import { UuidGenerator } from '../../../../../../libs/uuid/uuidGenerator';
import { Validator } from '../../../../../../libs/validator/validator';
import { CustomerAlreadyExistsError } from '../../../infrastructure/errors/customerAlreadyExistsError';
import { customerSymbols } from '../../../symbols';
import { CustomerRepositoryFactory } from '../../repositories/customerRepository/customerRepositoryFactory';

@Injectable()
export class CreateCustomerCommandHandlerImpl implements CreateCustomerCommandHandler {
  public constructor(
    @Inject(customerSymbols.customerRepositoryFactory)
    private readonly customerRepositoryFactory: CustomerRepositoryFactory,
    @Inject(loggerModuleSymbols.loggerService)
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(input: CreateCustomerCommandHandlerPayload): Promise<CreateCustomerCommandHandlerResult> {
    const {
      unitOfWork,
      draft: { userId },
    } = Validator.validate(createCustomerCommandHandlerPayloadSchema, input);

    this.loggerService.debug({ message: 'Creating customer...', context: { userId } });

    const entityManager = unitOfWork.getEntityManager();

    const customerRepository = this.customerRepositoryFactory.create(entityManager);

    const existingCustomer = await customerRepository.findCustomer({ userId });

    if (existingCustomer) {
      throw new CustomerAlreadyExistsError({ userId });
    }

    const customer = await customerRepository.createCustomer({ id: UuidGenerator.generateUuid(), userId });

    this.loggerService.info({ message: 'Customer created.', context: { customerId: customer.id } });

    return Validator.validate(createCustomerCommandHandlerResultSchema, { customer });
  }
}
