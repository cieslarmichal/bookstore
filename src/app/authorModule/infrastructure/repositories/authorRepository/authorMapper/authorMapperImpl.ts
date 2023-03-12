import { AuthorMapper } from './authorMapper';
import { Injectable } from '../../../../../../libs/dependencyInjection/decorators';
import { Author } from '../../../../domain/entities/author/author';
import { AuthorEntity } from '../authorEntity/authorEntity';

@Injectable()
export class AuthorMapperImpl implements AuthorMapper {
  public map({ id, firstName, lastName, about }: AuthorEntity): Author {
    return new Author({
      id,
      firstName,
      lastName,
      about: about || undefined,
    });
  }
}
