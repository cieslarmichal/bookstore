import { LoggerService } from '../../../shared/logger/services/loggerService';
import { AddressDto } from '../dtos';
import { AddressNotFound } from '../errors';
import { AddressRepository } from '../repositories/addressRepository';
import { CreateAddressData } from './types';

export class AddressService {
  public constructor(
    private readonly addressRepository: AddressRepository,
    private readonly loggerService: LoggerService,
  ) {}

  public async createAddress(addressData: CreateAddressData): Promise<AddressDto> {
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

    const address = await this.addressRepository.createOne(addressData);

    this.loggerService.info('Address created.', { addressId: address.id });

    return address;
  }

  public async findAddress(addressId: string): Promise<AddressDto> {
    const address = await this.addressRepository.findOneById(addressId);

    if (!address) {
      throw new AddressNotFound({ id: addressId });
    }

    return address;
  }

  public async removeAddress(addressId: string): Promise<void> {
    this.loggerService.debug('Removing address...', { addressId });

    await this.addressRepository.removeOne(addressId);

    this.loggerService.info('Address removed.', { addressId });
  }
}
