import { CreateAddressCommandHandler } from './createAddressCommandHandler.js';
import {
  CreateAddressCommandHandlerPayload,
  createAddressCommandHandlerPayloadSchema,
} from './payloads/createAddressCommandHandlerPayload.js';
import {
  CreateAddressCommandHandlerResult,
  createAddressCommandHandlerResultSchema,
} from './payloads/createAddressCommandHandlerResult.js';
import { Inject, Injectable } from '../../../../../../libs/dependencyInjection/decorators.js';
import { loggerModuleSymbols } from '../../../../../../libs/logger/loggerModuleSymbols.js';
import { LoggerService } from '../../../../../../libs/logger/services/loggerService/loggerService.js';
import { UuidGenerator } from '../../../../../../libs/uuid/uuidGenerator.js';
import { Validator } from '../../../../../../libs/validator/validator.js';
import { symbols } from '../../../symbols.js';
import { AddressRepositoryFactory } from '../../repositories/addressRepository/addressRepositoryFactory.js';

@Injectable()
export class CreateAddressCommandHandlerImpl implements CreateAddressCommandHandler {
  public constructor(
    @Inject(symbols.addressRepositoryFactory)
    private readonly addressRepositoryFactory: AddressRepositoryFactory,
    @Inject(loggerModuleSymbols.loggerService)
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(input: CreateAddressCommandHandlerPayload): Promise<CreateAddressCommandHandlerResult> {
    const { unitOfWork, draft } = Validator.validate(createAddressCommandHandlerPayloadSchema, input);

    this.loggerService.debug({ message: 'Creating address...', context: { ...draft } });

    const entityManager = unitOfWork.getEntityManager();

    const addressRepository = this.addressRepositoryFactory.create(entityManager);

    const address = await addressRepository.createAddress({
      id: UuidGenerator.generateUuid(),
      ...draft,
    });

    this.loggerService.info({ message: 'Address created.', context: { addressId: address.id } });

    return Validator.validate(createAddressCommandHandlerResultSchema, { address });
  }
}
