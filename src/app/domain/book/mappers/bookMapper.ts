import { Mapper } from 'src/app/shared/mapper';
import { Service } from 'typedi';
import { BookDto } from '../dtos';
import { Book } from '../entities/book';

@Service()
export class BookMapper implements Mapper<Book, BookDto> {
  public mapEntityToDto(entity: Book): BookDto {
    const {
      id,
      createdAt,
      updatedAt,
      title,
      author,
      releaseYear,
      language,
      format,
      description,
      price,
    } = entity;

    return BookDto.create({
      id,
      createdAt,
      updatedAt,
      title,
      author,
      releaseYear,
      language,
      format,
      description: description || null,
      price,
    });
  }
}
