import { Filter } from '../../../../../common/filter/filter';
import { LoggerService } from '../../../../../libs/logger/loggerService';
import { PostgresUnitOfWork } from '../../../../../libs/unitOfWork/postgresUnitOfWork';
import { PaginationData } from '../../../../common/paginationData';
import { Address } from '../../../contracts/address';
import { AddressRepositoryFactory } from '../../../contracts/factories/addressRepositoryFactory/addressRepositoryFactory';
import { AddressService } from '../../../contracts/services/addressService/addressService';
import { CreateAddressData } from '../../../contracts/services/addressService/createAddressData';
import { AddressNotFoundError } from '../../../errors/addressNotFoundError';

export class AddressServiceImpl implements AddressService {
  public constructor(
    private readonly addressRepositoryFactory: AddressRepositoryFactory,
    private readonly loggerService: LoggerService,
  ) {}

  public async createAddress(unitOfWork: PostgresUnitOfWork, addressData: CreateAddressData): Promise<Address> {
    const { firstName, lastName, phoneNumber, country, state, city, zipCode, streetAddress, customerId } = addressData;

    this.loggerService.debug('Creating address...', {
      firstName,
      lastName,
      phoneNumber,
      country,
      state,
      city,
      zipCode,
      streetAddress,
      customerId,
    });

    const { entityManager } = unitOfWork;

    const addressRepository = this.addressRepositoryFactory.create(entityManager);

    const address = await addressRepository.createOne({});

    this.loggerService.info('Address created.', { addressId: address.id });

    return address;
  }

  public async findAddress(unitOfWork: PostgresUnitOfWork, addressId: string): Promise<Address> {
    const { entityManager } = unitOfWork;

    const addressRepository = this.addressRepositoryFactory.create(entityManager);

    const address = await addressRepository.findOneById(addressId);

    if (!address) {
      throw new AddressNotFoundError({ id: addressId });
    }

    return address;
  }

  public async findAddresses(
    unitOfWork: PostgresUnitOfWork,
    filters: Filter[],
    paginationData: PaginationData,
  ): Promise<Address[]> {
    const { entityManager } = unitOfWork;

    const addressRepository = this.addressRepositoryFactory.create(entityManager);

    const authors = await addressRepository.findMany(filters, paginationData);

    return authors;
  }

  public async removeAddress(unitOfWork: PostgresUnitOfWork, addressId: string): Promise<void> {
    this.loggerService.debug('Removing address...', { addressId });

    const { entityManager } = unitOfWork;

    const addressRepository = this.addressRepositoryFactory.create(entityManager);

    await addressRepository.removeOne(addressId);

    this.loggerService.info('Address removed.', { addressId });
  }
}
