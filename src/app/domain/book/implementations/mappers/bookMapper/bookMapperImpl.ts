import { Injectable } from '../../../../../libs/dependencyInjection/contracts/decorators';
import { Book } from '../../../contracts/book';
import { BookEntity } from '../../../contracts/bookEntity';
import { BookMapper } from '../../../contracts/mappers/bookMapper/bookMapper';

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
