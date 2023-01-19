import { Book } from '../../../contracts/book';
import { BookDto } from '../../../contracts/bookDto';
import { BookMapper } from '../../../contracts/mappers/bookMapper/bookMapper';

export class BookMapperImpl implements BookMapper {
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
