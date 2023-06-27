import { CreateAddressCommandHandler } from './createAddressCommandHandler';
import {
  CreateAddressCommandHandlerPayload,
  createAddressCommandHandlerPayloadSchema,
} from './payloads/createAddressCommandHandlerPayload';
import {
  CreateAddressCommandHandlerResult,
  createAddressCommandHandlerResultSchema,
} from './payloads/createAddressCommandHandlerResult';
import { Inject, Injectable } from '../../../../../../libs/dependencyInjection/decorators';
import { loggerModuleSymbols } from '../../../../../../libs/logger/loggerModuleSymbols';
import { LoggerService } from '../../../../../../libs/logger/services/loggerService/loggerService';
import { UuidGenerator } from '../../../../../../libs/uuid/uuidGenerator';
import { Validator } from '../../../../../../libs/validator/validator';
import { symbols } from '../../../symbols';
import { AddressRepositoryFactory } from '../../repositories/addressRepository/addressRepositoryFactory';

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
