import { Book } from '../../../contracts/book';
import { BookEntity } from '../../../contracts/bookEntity';
import { BookMapper } from '../../../contracts/mappers/bookMapper/bookMapper';

export class BookMapperImpl implements BookMapper {
  public map(entity: BookEntity): Book {
    const { id, title, releaseYear, language, format, description, price } = entity;

    return new Book({
      id,
      title,
      releaseYear,
      language,
      format,
      description: description || undefined,
      price,
    });
  }
}
