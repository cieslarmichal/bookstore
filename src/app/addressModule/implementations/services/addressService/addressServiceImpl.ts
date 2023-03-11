import { Inject, Injectable } from '../../../../../../libs/dependencyInjection/contracts/decorators';
import { LoggerService } from '../../../../../../libs/logger/contracts/services/loggerService/loggerService';
import { loggerSymbols } from '../../../../../../libs/logger/loggerSymbols';
import { UuidGenerator } from '../../../../../../libs/uuid/implementations/uuidGenerator';
import { Validator } from '../../../../../../libs/validator/implementations/validator';
import { addressSymbols } from '../../../addressSymbols';
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

@Injectable()
export class AddressServiceImpl implements AddressService {
  public constructor(
    @Inject(addressSymbols.addressRepositoryFactory)
    private readonly addressRepositoryFactory: AddressRepositoryFactory,
    @Inject(loggerSymbols.loggerService)
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
