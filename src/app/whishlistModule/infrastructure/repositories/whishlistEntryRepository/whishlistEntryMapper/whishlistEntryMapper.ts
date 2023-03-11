import { Mapper } from '../../../../../../common/types/contracts/mapper';
import { WhishlistEntry } from '../../../../domain/entities/whishlistEntry/whishlistEntry';
import { WhishlistEntryEntity } from '../whishlistEntryEntity/whishlistEntryEntity';

export type WhishlistEntryMapper = Mapper<WhishlistEntryEntity, WhishlistEntry>;
