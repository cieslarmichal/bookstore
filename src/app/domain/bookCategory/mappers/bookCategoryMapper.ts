import { Mapper } from '../../../common/mapper';
import { BookCategoryDto } from '../dtos';
import { BookCategory } from '../entities/bookCategory';

export class BookCategoryMapper implements Mapper<BookCategory, BookCategoryDto> {
  public map(entity: BookCategory): BookCategoryDto {
    const { id, createdAt, updatedAt, bookId, categoryId } = entity;

    return BookCategoryDto.create({
      id,
      createdAt,
      updatedAt,
      bookId,
      categoryId,
    });
  }
}
