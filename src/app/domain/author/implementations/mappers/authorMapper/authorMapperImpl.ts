import { Author } from '../../../contracts/author';
import { AuthorEntity } from '../../../contracts/authorEntity';
import { AuthorMapper } from '../../../contracts/mappers/authorMapper/authorMapper';

export class AuthorMapperImpl implements AuthorMapper {
  public map(entity: AuthorEntity): Author {
    const { id, firstName, lastName, about } = entity;

    return new Author({
      id,
      firstName,
      lastName,
      about,
    });
  }
}
