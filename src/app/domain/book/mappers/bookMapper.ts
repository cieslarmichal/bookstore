import { Mapper } from 'src/app/shared/mapper/mapper';
import { BookDto } from '../dtos';
import { Book } from '../entities/book';

export class BookMapper implements Mapper<Book, BookDto> {
  public mapEntityToDto(entity: Book): BookDto {}
}
