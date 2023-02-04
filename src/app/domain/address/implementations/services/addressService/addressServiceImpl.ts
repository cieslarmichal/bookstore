import { LoggerService } from '../../../../../libs/logger/contracts/services/loggerService/loggerService';
import { UuidGenerator } from '../../../../../libs/uuid/uuidGenerator';
import { Address } from '../../../contracts/address';
import { AddressRepositoryFactory } from '../../../contracts/factories/addressRepositoryFactory/addressRepositoryFactory';
import { AddressService } from '../../../contracts/services/addressService/addressService';
import { CreateAddressPayload } from '../../../contracts/services/addressService/createAddressPayload';
import { DeleteAddressPayload } from '../../../contracts/services/addressService/deleteAddressPayload';
import { FindAddressesPayload } from '../../../contracts/services/addressService/findAddressesPayload';
import { FindAddressPayload } from '../../../contracts/services/addressService/findAddressPayload';
import { UpdateAddressPayload } from '../../../contracts/services/addressService/updateAddressPayload';
import { AddressNotFoundError } from '../../../errors/addressNotFoundError';

export class AddressServiceImpl implements AddressService {
  public constructor(
    private readonly addressRepositoryFactory: AddressRepositoryFactory,
    private readonly loggerService: LoggerService,
  ) {}

  public async createAddress(input: CreateAddressPayload): Promise<Address> {
    const { unitOfWork, draft } = input;

    this.loggerService.debug({ message: 'Creating address...', context: { ...draft } });

    const { entityManager } = unitOfWork;

    const addressRepository = this.addressRepositoryFactory.create(entityManager);

    const address = await addressRepository.createOne({
      id: UuidGenerator.generateUuid(),
      ...draft,
    });

    this.loggerService.info({ message: 'Address created.', context: { addressId: address.id } });

    return address;
  }

  public async findAddress(input: FindAddressPayload): Promise<Address> {
    const { unitOfWork, addressId } = input;

    const { entityManager } = unitOfWork;

    const addressRepository = this.addressRepositoryFactory.create(entityManager);

    const address = await addressRepository.findOne({ id: addressId });

    if (!address) {
      throw new AddressNotFoundError({ id: addressId });
    }

    return address;
  }

  public async findAddresses(input: FindAddressesPayload): Promise<Address[]> {
    const { unitOfWork, filters, pagination } = input;

    const { entityManager } = unitOfWork;

    const addressRepository = this.addressRepositoryFactory.create(entityManager);

    const authors = await addressRepository.findMany({ filters, pagination });

    return authors;
  }

  public async updateAddress(input: UpdateAddressPayload): Promise<Address> {
    const { unitOfWork, draft, addressId } = input;

    this.loggerService.debug({ message: 'Updating address...', context: { addressId, ...draft } });

    const { entityManager } = unitOfWork;

    const addressRepository = this.addressRepositoryFactory.create(entityManager);

    const address = await addressRepository.updateOne({ id: addressId, draft });

    this.loggerService.info({ message: 'Address updated.', context: { addressId: address.id } });

    return address;
  }

  public async deleteAddress(input: DeleteAddressPayload): Promise<void> {
    const { unitOfWork, addressId } = input;

    this.loggerService.debug({ message: 'Deleting address...', context: { addressId } });

    const { entityManager } = unitOfWork;

    const addressRepository = this.addressRepositoryFactory.create(entityManager);

    await addressRepository.deleteOne({ id: addressId });

    this.loggerService.info({ message: 'Address deleted.', context: { addressId } });
  }
}
