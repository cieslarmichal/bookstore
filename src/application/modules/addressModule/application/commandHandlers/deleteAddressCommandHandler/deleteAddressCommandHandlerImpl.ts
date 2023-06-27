import { DeleteAddressCommandHandler } from './deleteAddressCommandHandler';
import {
  DeleteAddressCommandHandlerPayload,
  deleteAddressCommandHandlerPayloadSchema,
} from './payloads/deleteAddressCommandHandlerPayload';
import { Inject, Injectable } from '../../../../../../libs/dependencyInjection/decorators';
import { loggerModuleSymbols } from '../../../../../../libs/logger/loggerModuleSymbols';
import { LoggerService } from '../../../../../../libs/logger/services/loggerService/loggerService';
import { Validator } from '../../../../../../libs/validator/validator';
import { symbols } from '../../../symbols';
import { AddressRepositoryFactory } from '../../repositories/addressRepository/addressRepositoryFactory';

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
