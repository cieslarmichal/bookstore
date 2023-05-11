import { DeleteAddressCommandHandler } from './deleteAddressCommandHandler.js';
import {
  DeleteAddressCommandHandlerPayload,
  deleteAddressCommandHandlerPayloadSchema,
} from './payloads/deleteAddressCommandHandlerPayload.js';
import { Inject, Injectable } from '../../../../../../libs/dependencyInjection/decorators.js';
import { loggerModuleSymbols } from '../../../../../../libs/logger/loggerModuleSymbols.js';
import { LoggerService } from '../../../../../../libs/logger/services/loggerService/loggerService.js';
import { Validator } from '../../../../../../libs/validator/validator.js';
import { symbols } from '../../../symbols.js';
import { AddressRepositoryFactory } from '../../repositories/addressRepository/addressRepositoryFactory.js';

@Injectable()
export class DeleteAddressCommandHandlerImpl implements DeleteAddressCommandHandler {
  public constructor(
    @Inject(symbols.addressRepositoryFactory)
    private readonly addressRepositoryFactory: AddressRepositoryFactory,
    @Inject(loggerModuleSymbols.loggerService)
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(input: DeleteAddressCommandHandlerPayload): Promise<void> {
    const { unitOfWork, addressId } = Validator.validate(deleteAddressCommandHandlerPayloadSchema, input);

    this.loggerService.debug({ message: 'Deleting address...', context: { addressId } });

    const entityManager = unitOfWork.getEntityManager();

    const addressRepository = this.addressRepositoryFactory.create(entityManager);

    await addressRepository.deleteAddress({ id: addressId });

    this.loggerService.info({ message: 'Address deleted.', context: { addressId } });
  }
}
