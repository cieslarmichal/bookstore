import { Filter, PostgresUnitOfWork } from '../../../common';
import { LoggerService } from '../../../common/logger/services/loggerService';
import { PaginationData } from '../../shared';
import { AddressDto } from '../dtos';
import { AddressNotFound } from '../errors';
import { AddressRepositoryFactory } from '../repositories/addressRepositoryFactory';
import { CreateAddressData } from './types';

export class AddressService {
  public constructor(
    private readonly addressRepositoryFactory: AddressRepositoryFactory,
    private readonly loggerService: LoggerService,
  ) {}

  public async createAddress(unitOfWork: PostgresUnitOfWork, addressData: CreateAddressData): Promise<AddressDto> {
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

    const address = await addressRepository.createOne(addressData);

    this.loggerService.info('Address created.', { addressId: address.id });

    return address;
  }

  public async findAddress(unitOfWork: PostgresUnitOfWork, addressId: string): Promise<AddressDto> {
    const { entityManager } = unitOfWork;

    const addressRepository = this.addressRepositoryFactory.create(entityManager);

    const address = await addressRepository.findOneById(addressId);

    if (!address) {
      throw new AddressNotFound({ id: addressId });
    }

    return address;
  }

  public async findAddresses(
    unitOfWork: PostgresUnitOfWork,
    filters: Filter[],
    paginationData: PaginationData,
  ): Promise<AddressDto[]> {
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
