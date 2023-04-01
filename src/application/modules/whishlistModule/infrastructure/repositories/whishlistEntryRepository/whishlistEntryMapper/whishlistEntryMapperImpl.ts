import { WhishlistEntryMapper } from './whishlistEntryMapper';
import { Injectable } from '../../../../../../../libs/dependencyInjection/decorators';
import { WhishlistEntry } from '../../../../domain/entities/whishlistEntry/whishlistEntry';
import { WhishlistEntryEntity } from '../whishlistEntryEntity/whishlistEntryEntity';

@Injectable()
export class WhishlistEntryMapperImpl implements WhishlistEntryMapper {
  public map({ id, bookId, customerId }: WhishlistEntryEntity): WhishlistEntry {
    return new WhishlistEntry({
      id,
      bookId,
      customerId,
    });
  }
}
