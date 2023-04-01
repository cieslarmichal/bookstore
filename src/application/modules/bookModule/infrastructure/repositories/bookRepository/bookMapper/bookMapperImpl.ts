import { BookMapper } from './bookMapper';
import { Injectable } from '../../../../../../../libs/dependencyInjection/decorators';
import { Book } from '../../../../domain/entities/book/book';
import { BookEntity } from '../bookEntity/bookEntity';

@Injectable()
export class BookMapperImpl implements BookMapper {
  public map({ id, title, isbn, releaseYear, language, format, description, price }: BookEntity): Book {
    return new Book({
      id,
      title,
      isbn,
      releaseYear,
      language,
      format,
      description: description || undefined,
      price,
    });
  }
}
