import { Mapper } from '../../../../../../common/types/contracts/mapper';
import { Address } from '../../../../domain/entities/address';
import { AddressEntity } from '../addressEntity/addressEntity';

export type AddressMapper = Mapper<AddressEntity, Address>;