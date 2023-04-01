import { AddressService } from './addressService';
import { CreateAddressPayload, createAddressPayloadSchema } from './payloads/createAddressPayload';
import { DeleteAddressPayload, deleteAddressPayloadSchema } from './payloads/deleteAddressPayload';
import { FindAddressesPayload, findAddressesPayloadSchema } from './payloads/findAddressesPayload';
import { FindAddressPayload, findAddressPayloadSchema } from './payloads/findAddressPayload';
import { UpdateAddressPayload, updateAddressPayloadSchema } from './payloads/updateAddressPayload';
import { Validator } from '../../../../../../libs/validator/validator';
import { Injectable, Inject } from '../../../../../libs/dependencyInjection/decorators';
import { loggerModuleSymbols } from '../../../../../libs/logger/loggerModuleSymbols';
import { LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService';
import { UuidGenerator } from '../../../../../libs/uuid/uuidGenerator';
import { addressModuleSymbols } from '../../../addressModuleSymbols';
import { Address } from '../../../domain/entities/address/address';
import { AddressNotFoundError } from '../../../infrastructure/errors/addressNotFoundError';
import { AddressRepositoryFactory } from '../../repositories/addressRepository/addressRepositoryFactory';

@Injectable()
export class AddressServiceImpl implements AddressService {
  public constructor(
    @Inject(addressModuleSymbols.addressRepositoryFactory)
    private readonly addressRepositoryFactory: AddressRepositoryFactory,
    @Inject(loggerModuleSymbols.loggerService)
    private readonly loggerService: LoggerService,
  ) {}

  public async createAddress(input: CreateAddressPayload): Promise<Address> {
    const { unitOfWork, draft } = Validator.validate(createAddressPayloadSchema, input);

    this.loggerService.debug({ message: 'Creating address...', context: { ...draft } });

    const entityManager = unitOfWork.getEntityManager();

    const addressRepository = this.addressRepositoryFactory.create(entityManager);

    const address = await addressRepository.createOne({
      id: UuidGenerator.generateUuid(),
      ...draft,
    });

    this.loggerService.info({ message: 'Address created.', context: { addressId: address.id } });

    return address;
  }

  public async findAddress(input: FindAddressPayload): Promise<Address> {
    const { unitOfWork, addressId } = Validator.validate(findAddressPayloadSchema, input);

    const entityManager = unitOfWork.getEntityManager();

    const addressRepository = this.addressRepositoryFactory.create(entityManager);

    const address = await addressRepository.findOne({ id: addressId });

    if (!address) {
      throw new AddressNotFoundError({ id: addressId });
    }

    return address;
  }

  public async findAddresses(input: FindAddressesPayload): Promise<Address[]> {
    const { unitOfWork, filters, pagination } = Validator.validate(findAddressesPayloadSchema, input);

    const entityManager = unitOfWork.getEntityManager();

    const addressRepository = this.addressRepositoryFactory.create(entityManager);

    const addresses = await addressRepository.findMany({ filters, pagination });

    return addresses;
  }

  public async updateAddress(input: UpdateAddressPayload): Promise<Address> {
    const { unitOfWork, draft, addressId } = Validator.validate(updateAddressPayloadSchema, input);

    this.loggerService.debug({ message: 'Updating address...', context: { addressId, ...draft } });

    const entityManager = unitOfWork.getEntityManager();

    const addressRepository = this.addressRepositoryFactory.create(entityManager);

    const address = await addressRepository.updateOne({ id: addressId, draft });

    this.loggerService.info({ message: 'Address updated.', context: { addressId: address.id } });

    return address;
  }

  public async deleteAddress(input: DeleteAddressPayload): Promise<void> {
    const { unitOfWork, addressId } = Validator.validate(deleteAddressPayloadSchema, input);

    this.loggerService.debug({ message: 'Deleting address...', context: { addressId } });

    const entityManager = unitOfWork.getEntityManager();

    const addressRepository = this.addressRepositoryFactory.create(entityManager);

    await addressRepository.deleteOne({ id: addressId });

    this.loggerService.info({ message: 'Address deleted.', context: { addressId } });
  }
}
