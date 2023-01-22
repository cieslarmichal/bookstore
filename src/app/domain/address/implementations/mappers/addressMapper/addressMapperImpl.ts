import { Address } from '../../../contracts/address';
import { AddressEntity } from '../../../contracts/addressEntity';
import { AddressMapper } from '../../../contracts/mappers/addressMapper/addressMapper';

export class AddressMapperImpl implements AddressMapper {
  public map(entity: AddressEntity): Address {
    const {
      id,
      createdAt,
      updatedAt,
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
      createdAt,
      updatedAt,
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
