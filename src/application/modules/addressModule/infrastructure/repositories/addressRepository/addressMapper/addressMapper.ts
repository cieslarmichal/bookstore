import { Mapper } from '../../../../../../../common/types/mapper';
import { Address } from '../../../../domain/entities/address/address';
import { AddressEntity } from '../addressEntity/addressEntity';

export type AddressMapper = Mapper<AddressEntity, Address>;
