import { FindCustomerQueryHandler } from './findCustomerQueryHandler';
import {
  FindCustomerQueryHandlerPayload,
  findCustomerQueryHandlerPayloadSchema,
} from './payloads/findCustomerQueryHandlerPayload';
import {
  FindCustomerQueryHandlerResult,
  findCustomerQueryHandlerResultSchema,
} from './payloads/findCustomerQueryHandlerResult';
import { Injectable, Inject } from '../../../../../../libs/dependencyInjection/decorators';
import { Validator } from '../../../../../../libs/validator/validator';
import { CustomerNotFoundError } from '../../errors/customerNotFoundError';
import { customerSymbols } from '../../../symbols';
import { CustomerRepositoryFactory } from '../../repositories/customerRepository/customerRepositoryFactory';

@Injectable()
export class FindCustomerQueryHandlerImpl implements FindCustomerQueryHandler {
  public constructor(
    @Inject(customerSymbols.customerRepositoryFactory)
    private readonly customerRepositoryFactory: CustomerRepositoryFactory,
  ) {}

  public async execute(input: FindCustomerQueryHandlerPayload): Promise<FindCustomerQueryHandlerResult> {
    const { unitOfWork, customerId, userId } = Validator.validate(findCustomerQueryHandlerPayloadSchema, input);

    const entityManager = unitOfWork.getEntityManager();

    const customerRepository = this.customerRepositoryFactory.create(entityManager);

    let findOnePayload = {};

    if (customerId) {
      findOnePayload = { ...findOnePayload, id: customerId };
    }

    if (userId) {
      findOnePayload = { ...findOnePayload, userId };
    }

    const customer = await customerRepository.findCustomer(findOnePayload);

    if (!customer) {
      throw new CustomerNotFoundError({ ...findOnePayload });
    }

    return Validator.validate(findCustomerQueryHandlerResultSchema, { customer });
  }
}
