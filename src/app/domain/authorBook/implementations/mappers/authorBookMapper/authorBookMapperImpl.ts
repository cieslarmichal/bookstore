import { AuthorBook } from '../../../contracts/authorBook';
import { AuthorBookEntity } from '../../../contracts/authorBookEntity';
import { AuthorBookMapper } from '../../../contracts/mappers/authorBookMapper/authorBookMapper';

export class AuthorBookMapperImpl implements AuthorBookMapper {
  public map(entity: AuthorBookEntity): AuthorBook {
    const { id, createdAt, updatedAt, authorId, bookId } = entity;

    return new AuthorBook({
      id,
      createdAt,
      updatedAt,
      authorId,
      bookId,
    });
  }
}
