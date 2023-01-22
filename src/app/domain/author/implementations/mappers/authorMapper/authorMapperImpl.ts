import { Author } from '../../../contracts/author';
import { AuthorEntity } from '../../../contracts/authorEntity';
import { AuthorMapper } from '../../../contracts/mappers/authorMapper/authorMapper';

export class AuthorMapperImpl implements AuthorMapper {
  public map(entity: AuthorEntity): Author {
    const { id, createdAt, updatedAt, firstName, lastName, about } = entity;

    return new Author({
      id,
      createdAt,
      updatedAt,
      firstName,
      lastName,
      about,
    });
  }
}
