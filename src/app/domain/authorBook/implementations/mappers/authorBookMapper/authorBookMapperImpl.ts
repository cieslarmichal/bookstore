import { Injectable } from '../../../../../../libs/dependencyInjection/contracts/decorators';
import { AuthorBook } from '../../../contracts/authorBook';
import { AuthorBookEntity } from '../../../contracts/authorBookEntity';
import { AuthorBookMapper } from '../../../contracts/mappers/authorBookMapper/authorBookMapper';

@Injectable()
export class AuthorBookMapperImpl implements AuthorBookMapper {
  public map({ id, authorId, bookId }: AuthorBookEntity): AuthorBook {
    return new AuthorBook({
      id,
      authorId,
      bookId,
    });
  }
}
