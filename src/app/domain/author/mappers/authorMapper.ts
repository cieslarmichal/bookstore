import { Mapper } from '../../../shared/mapper';
import { BookMapper } from '../../book/mappers/bookMapper';
import { AuthorDto } from '../dtos';
import { Author } from '../entities/author';

export class AuthorMapper implements Mapper<Author, AuthorDto> {
  public constructor(private readonly bookMapper: BookMapper) {}

  public mapEntityToDto(entity: Author): AuthorDto {
    const { id, createdAt, updatedAt, firstName, lastName, about, books } = entity;

    const booksDto = books ? books.map((book) => this.bookMapper.mapEntityToDto(book)) : null;

    return AuthorDto.create({
      id,
      createdAt,
      updatedAt,
      firstName,
      lastName,
      about: about || null,
      books: booksDto,
    });
  }
}
