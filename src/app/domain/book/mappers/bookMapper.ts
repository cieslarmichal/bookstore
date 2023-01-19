import { Mapper } from '../../../common/mapper';
import { BookDto } from '../dtos';
import { Book } from '../entities/book';

export class BookMapper implements Mapper<Book, BookDto> {
  public map(entity: Book): BookDto {
    const { id, createdAt, updatedAt, title, releaseYear, language, format, description, price } = entity;

    return BookDto.create({
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
