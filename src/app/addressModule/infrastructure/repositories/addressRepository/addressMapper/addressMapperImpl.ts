import { AddressMapper } from './addressMapper';
import { Injectable } from '../../../../../../libs/dependencyInjection/contracts/decorators';
import { Address } from '../../../../domain/entities/address/address';
import { AddressEntity } from '../addressEntity/addressEntity';

@Injectable()
export class AddressMapperImpl implements AddressMapper {
  public map({
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
  }: AddressEntity): Address {
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
      deliveryInstructions: deliveryInstructions || undefined,
      customerId,
    });
  }
}
