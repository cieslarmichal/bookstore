import { CreateAddressPayload } from './createAddressPayload';
import { DeleteAddressPayload } from './deleteAddressPayload';
import { FindAddressesPayload } from './findAddressesPayload';
import { FindAddressPayload } from './findAddressPayload';
import { UpdateAddressPayload } from './updateAddressPayload';
import { Address } from '../../address';

export interface AddressService {
  createAddress(input: CreateAddressPayload): Promise<Address>;
  findAddress(input: FindAddressPayload): Promise<Address>;
  findAddresses(input: FindAddressesPayload): Promise<Address[]>;
  updateAddress(input: UpdateAddressPayload): Promise<Address>;
  deleteAddress(input: DeleteAddressPayload): Promise<void>;
}
