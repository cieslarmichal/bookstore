import { Mapper } from '../../../shared/mapper';
import { AuthorBookDto } from '../dtos';
import { AuthorBook } from '../entities/authorBook';

export class AuthorBookMapper implements Mapper<AuthorBook, AuthorBookDto> {
  public mapEntityToDto(entity: AuthorBook): AuthorBookDto {
    const { id, createdAt, updatedAt, authorId, bookId } = entity;

    return AuthorBookDto.create({
      id,
      createdAt,
      updatedAt,
      authorId,
      bookId,
    });
  }
}
