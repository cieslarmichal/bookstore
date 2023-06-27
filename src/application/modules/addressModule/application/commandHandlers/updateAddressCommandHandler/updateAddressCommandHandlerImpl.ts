import {
  UpdateAddressCommandHandlerPayload,
  updateAddressCommandHandlerPayloadSchema,
} from './payloads/updateAddressCommandHandlerPayload';
import {
  UpdateAddressCommandHandlerResult,
  updateAddressCommandHandlerResultSchema,
} from './payloads/updateAddressCommandHandlerResult';
import { UpdateAddressCommandHandler } from './updateAddressCommandHandler';
import { Inject, Injectable } from '../../../../../../libs/dependencyInjection/decorators';
import { loggerModuleSymbols } from '../../../../../../libs/logger/loggerModuleSymbols';
import { LoggerService } from '../../../../../../libs/logger/services/loggerService/loggerService';
import { Validator } from '../../../../../../libs/validator/validator';
import { symbols } from '../../../symbols';
import { AddressRepositoryFactory } from '../../repositories/addressRepository/addressRepositoryFactory';

@Injectable()
export class UpdateAddressCommandHandlerImpl implements UpdateAddressCommandHandler {
  public constructor(
    @Inject(symbols.addressRepositoryFactory)
    private readonly addressRepositoryFactory: AddressRepositoryFactory,
    @Inject(loggerModuleSymbols.loggerService)
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(input: UpdateAddressCommandHandlerPayload): Promise<UpdateAddressCommandHandlerResult> {
    const { unitOfWork, draft, addressId } = Validator.validate(updateAddressCommandHandlerPayloadSchema, input);

    this.loggerService.debug({ message: 'Updating address...', context: { addressId, ...draft } });

    const entityManager = unitOfWork.getEntityManager();

    const addressRepository = this.addressRepositoryFactory.create(entityManager);

    const address = await addressRepository.updateAddress({ id: addressId, draft });

    this.loggerService.info({ message: 'Address updated.', context: { addressId: address.id } });

    return Validator.validate(updateAddressCommandHandlerResultSchema, { address });
  }
}
