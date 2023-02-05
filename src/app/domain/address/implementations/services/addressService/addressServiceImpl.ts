import { PayloadFactory } from '../../../../../common/validator/implementations/payloadFactory';
import { LoggerService } from '../../../../../libs/logger/contracts/services/loggerService/loggerService';
import { UuidGenerator } from '../../../../../libs/uuid/implementations/uuidGenerator';
import { Address } from '../../../contracts/address';
import { AddressRepositoryFactory } from '../../../contracts/factories/addressRepositoryFactory/addressRepositoryFactory';
import { AddressService } from '../../../contracts/services/addressService/addressService';
import {
  CreateAddressPayload,
  createAddressPayloadSchema,
} from '../../../contracts/services/addressService/createAddressPayload';
import {
  DeleteAddressPayload,
  deleteAddressPayloadSchema,
} from '../../../contracts/services/addressService/deleteAddressPayload';
import {
  FindAddressesPayload,
  findAddressesPayloadSchema,
} from '../../../contracts/services/addressService/findAddressesPayload';
import {
  FindAddressPayload,
  findAddressPayloadSchema,
} from '../../../contracts/services/addressService/findAddressPayload';
import {
  UpdateAddressPayload,
  updateAddressPayloadSchema,
} from '../../../contracts/services/addressService/updateAddressPayload';
import { AddressNotFoundError } from '../../../errors/addressNotFoundError';

export class AddressServiceImpl implements AddressService {
  public constructor(
    private readonly addressRepositoryFactory: AddressRepositoryFactory,
    private readonly loggerService: LoggerService,
  ) {}

  public async createAddress(input: CreateAddressPayload): Promise<Address> {
    const { unitOfWork, draft } = PayloadFactory.create(createAddressPayloadSchema, input);

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
    const { unitOfWork, addressId } = PayloadFactory.create(findAddressPayloadSchema, input);

    const entityManager = unitOfWork.getEntityManager();

    const addressRepository = this.addressRepositoryFactory.create(entityManager);

    const address = await addressRepository.findOne({ id: addressId });

    if (!address) {
      throw new AddressNotFoundError({ id: addressId });
    }

    return address;
  }

  public async findAddresses(input: FindAddressesPayload): Promise<Address[]> {
    const { unitOfWork, filters, pagination } = PayloadFactory.create(findAddressesPayloadSchema, input);

    const entityManager = unitOfWork.getEntityManager();

    const addressRepository = this.addressRepositoryFactory.create(entityManager);

    const authors = await addressRepository.findMany({ filters, pagination });

    return authors;
  }

  public async updateAddress(input: UpdateAddressPayload): Promise<Address> {
    const { unitOfWork, draft, addressId } = PayloadFactory.create(updateAddressPayloadSchema, input);

    this.loggerService.debug({ message: 'Updating address...', context: { addressId, ...draft } });

    const entityManager = unitOfWork.getEntityManager();

    const addressRepository = this.addressRepositoryFactory.create(entityManager);

    const address = await addressRepository.updateOne({ id: addressId, draft });

    this.loggerService.info({ message: 'Address updated.', context: { addressId: address.id } });

    return address;
  }

  public async deleteAddress(input: DeleteAddressPayload): Promise<void> {
    const { unitOfWork, addressId } = PayloadFactory.create(deleteAddressPayloadSchema, input);

    this.loggerService.debug({ message: 'Deleting address...', context: { addressId } });

    const entityManager = unitOfWork.getEntityManager();

    const addressRepository = this.addressRepositoryFactory.create(entityManager);

    await addressRepository.deleteOne({ id: addressId });

    this.loggerService.info({ message: 'Address deleted.', context: { addressId } });
  }
}
