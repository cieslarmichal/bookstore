import { BookEntity } from '../../../contracts/bookEntity';
import { Book } from '../../../contracts/book';
import { BookMapper } from '../../../contracts/mappers/bookMapper/bookMapper';

export class BookMapperImpl implements BookMapper {
  public map(entity: BookEntity): Book {
    const { id, createdAt, updatedAt, title, releaseYear, language, format, description, price } = entity;

    return Book.create({
      id,
      createdAt,
      updatedAt,
      title,
      releaseYear,
      language,
      format,
      description: description || null,
      price,
    });
  }
}
