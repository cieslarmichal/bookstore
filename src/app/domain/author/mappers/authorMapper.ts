import { Mapper } from '../../../common/mapper';
import { AuthorDto } from '../dtos';
import { Author } from '../entities/author';

export class AuthorMapper implements Mapper<Author, AuthorDto> {
  public map(entity: Author): AuthorDto {
    const { id, createdAt, updatedAt, firstName, lastName, about } = entity;

    return AuthorDto.create({
      id,
      createdAt,
      updatedAt,
      firstName,
      lastName,
      about: about || null,
    });
  }
}
