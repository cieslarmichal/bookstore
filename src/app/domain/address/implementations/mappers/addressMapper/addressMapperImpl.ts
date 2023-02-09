import { Injectable } from '../../../../../libs/dependencyInjection/contracts/decorators';
import { Address } from '../../../contracts/address';
import { AddressEntity } from '../../../contracts/addressEntity';
import { AddressMapper } from '../../../contracts/mappers/addressMapper/addressMapper';

@Injectable()
export class AddressMapperImpl implements AddressMapper {
  public map(entity: AddressEntity): Address {
    const {
      id,
      firstName,
      lastName,
      phoneNumber,
      country,
      state,
      city,
      zipCode,
      streetAddress,
      deliveryInstructions,
      customerId,
    } = entity;

    return new Address({
      id,
      firstName,
      lastName,
      phoneNumber,
      country,
      state,
      city,
      zipCode,
      streetAddress,
      deliveryInstructions,
      customerId,
    });
  }
}
