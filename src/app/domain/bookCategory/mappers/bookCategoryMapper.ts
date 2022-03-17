import { Mapper } from '../../../shared/mapper';
import { BookCategoryDto } from '../dtos';
import { BookCategory } from '../entities/bookCategory';

export class BookCategoryMapper implements Mapper<BookCategory, BookCategoryDto> {
  public mapEntityToDto(entity: BookCategory): BookCategoryDto {
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
