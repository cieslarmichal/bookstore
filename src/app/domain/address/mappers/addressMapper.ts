import { Mapper } from '../../../common/mapper';
import { AddressDto } from '../dtos';
import { Address } from '../entities/address';

export class AddressMapper implements Mapper<Address, AddressDto> {
  public map(entity: Address): AddressDto {
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

    return AddressDto.create({
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
      deliveryInstructions: deliveryInstructions || null,
      customerId,
    });
  }
}
