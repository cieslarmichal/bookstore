import { CreateAddressPayload } from './payloads/createAddressPayload';
import { DeleteAddressPayload } from './payloads/deleteAddressPayload';
import { FindAddressesPayload } from './payloads/findAddressesPayload';
import { FindAddressPayload } from './payloads/findAddressPayload';
import { UpdateAddressPayload } from './payloads/updateAddressPayload';
import { Address } from '../../../domain/entities/address/address';

export interface AddressRepository {
  createAddress(input: CreateAddressPayload): Promise<Address>;
  findAddress(input: FindAddressPayload): Promise<Address | null>;
  findAddresses(input: FindAddressesPayload): Promise<Address[]>;
  updateAddress(input: UpdateAddressPayload): Promise<Address>;
  deleteAddress(input: DeleteAddressPayload): Promise<void>;
}
