import { AuthorBookMapper } from './authorBookMapper';
import { Injectable } from '../../../../../../libs/dependencyInjection/decorators';
import { AuthorBook } from '../../../../domain/entities/authorBook/authorBook';
import { AuthorBookEntity } from '../authorBookEntity/authorBookEntity';

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
