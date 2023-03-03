import { Injectable } from '../../../../../libs/dependencyInjection/contracts/decorators';
import { WhishlistEntryMapper } from '../../../contracts/mappers/whishlistEntryMapper/whishlistEntryMapper';
import { WhishlistEntry } from '../../../contracts/whishlistEntry';
import { WhishlistEntryEntity } from '../../../contracts/whishlistEntryEntity';

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
