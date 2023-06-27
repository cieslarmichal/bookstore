import { FindAddressesQueryHandler } from './findAddressesQueryHandler';
import {
  FindAddressesQueryHandlerPayload,
  findAddressesQueryHandlerPayloadSchema,
} from './payloads/findAddressesQueryHandlerPayload';
import {
  FindAddressesQueryHandlerResult,
  findAddressesQueryHandlerResultSchema,
} from './payloads/findAddressesQueryHandlerResult';
import { Injectable, Inject } from '../../../../../../libs/dependencyInjection/decorators';
import { loggerModuleSymbols } from '../../../../../../libs/logger/loggerModuleSymbols';
import { LoggerService } from '../../../../../../libs/logger/services/loggerService/loggerService';
import { Validator } from '../../../../../../libs/validator/validator';
import { symbols } from '../../../symbols';
import { AddressRepositoryFactory } from '../../repositories/addressRepository/addressRepositoryFactory';

@Injectable()
export class FindAddressesQueryHandlerImpl implements FindAddressesQueryHandler {
  public constructor(
    @Inject(symbols.addressRepositoryFactory)
    private readonly addressRepositoryFactory: AddressRepositoryFactory,
    @Inject(loggerModuleSymbols.loggerService)
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(input: FindAddressesQueryHandlerPayload): Promise<FindAddressesQueryHandlerResult> {
    const { unitOfWork, filters, pagination } = Validator.validate(findAddressesQueryHandlerPayloadSchema, input);

    const entityManager = unitOfWork.getEntityManager();

    const addressRepository = this.addressRepositoryFactory.create(entityManager);

    this.loggerService.debug({ message: 'Fetching addresses...', context: { filters, pagination } });

    const addresses = await addressRepository.findAddresses({ filters, pagination });

    this.loggerService.info({ message: 'Addresses fetched.', context: { numberOfAddresses: addresses.length } });

    return Validator.validate(findAddressesQueryHandlerResultSchema, { addresses });
  }
}
