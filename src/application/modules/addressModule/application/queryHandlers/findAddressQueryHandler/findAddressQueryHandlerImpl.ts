import { FindAddressQueryHandler } from './findAddressQueryHandler';
import {
  FindAddressQueryHandlerPayload,
  findAddressQueryHandlerPayloadSchema,
} from './payloads/findAddressQueryHandlerPayload';
import {
  FindAddressQueryHandlerResult,
  findAddressQueryHandlerResultSchema,
} from './payloads/findAddressQueryHandlerResult';
import { Injectable, Inject } from '../../../../../../libs/dependencyInjection/decorators';
import { loggerModuleSymbols } from '../../../../../../libs/logger/loggerModuleSymbols';
import { LoggerService } from '../../../../../../libs/logger/services/loggerService/loggerService';
import { Validator } from '../../../../../../libs/validator/validator';
import { symbols } from '../../../symbols';
import { AddressNotFoundError } from '../../errors/addressNotFoundError';
import { AddressRepositoryFactory } from '../../repositories/addressRepository/addressRepositoryFactory';

@Injectable()
export class FindAddressQueryHandlerImpl implements FindAddressQueryHandler {
  public constructor(
    @Inject(symbols.addressRepositoryFactory)
    private readonly addressRepositoryFactory: AddressRepositoryFactory,
    @Inject(loggerModuleSymbols.loggerService)
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(input: FindAddressQueryHandlerPayload): Promise<FindAddressQueryHandlerResult> {
    const { unitOfWork, addressId } = Validator.validate(findAddressQueryHandlerPayloadSchema, input);

    const entityManager = unitOfWork.getEntityManager();

    const addressRepository = this.addressRepositoryFactory.create(entityManager);

    this.loggerService.debug({ message: 'Fetching address...', context: { addressId } });

    const address = await addressRepository.findAddress({ id: addressId });

    if (!address) {
      throw new AddressNotFoundError({ addressId });
    }

    this.loggerService.info({ message: 'Address fetched.', context: { address } });

    return Validator.validate(findAddressQueryHandlerResultSchema, { address });
  }
}
