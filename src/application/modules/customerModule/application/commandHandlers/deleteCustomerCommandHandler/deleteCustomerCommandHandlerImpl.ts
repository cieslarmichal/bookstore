import { DeleteCustomerCommandHandler } from './deleteCustomerCommandHandler';
import {
  DeleteCustomerCommandHandlerPayload,
  deleteCustomerCommandHandlerPayloadSchema,
} from './payloads/deleteCustomerCommandHandlerPayload';
import { Injectable, Inject } from '../../../../../../libs/dependencyInjection/decorators';
import { loggerModuleSymbols } from '../../../../../../libs/logger/loggerModuleSymbols';
import { LoggerService } from '../../../../../../libs/logger/services/loggerService/loggerService';
import { Validator } from '../../../../../../libs/validator/validator';
import { customerSymbols } from '../../../symbols';
import { CustomerRepositoryFactory } from '../../repositories/customerRepository/customerRepositoryFactory';

@Injectable()
export class DeleteCustomerCommandHandlerImpl implements DeleteCustomerCommandHandler {
  public constructor(
    @Inject(customerSymbols.customerRepositoryFactory)
    private readonly customerRepositoryFactory: CustomerRepositoryFactory,
    @Inject(loggerModuleSymbols.loggerService)
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(input: DeleteCustomerCommandHandlerPayload): Promise<void> {
    const { unitOfWork, customerId } = Validator.validate(deleteCustomerCommandHandlerPayloadSchema, input);

    this.loggerService.debug({ message: 'Deleting customer...', context: { customerId } });

    const entityManager = unitOfWork.getEntityManager();

    const customerRepository = this.customerRepositoryFactory.create(entityManager);

    await customerRepository.deleteCustomer({ id: customerId });

    this.loggerService.info({ message: 'Customer deleted.', context: { customerId } });
  }
}
