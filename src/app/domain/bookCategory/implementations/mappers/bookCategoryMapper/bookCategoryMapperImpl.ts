import { BookCategory } from '../../../contracts/bookCategory';
import { BookCategoryEntity } from '../../../contracts/bookCategoryEntity';
import { BookCategoryMapper } from '../../../contracts/mappers/bookCategoryMapper/bookCategoryMapper';

export class BookCategoryMapperImpl implements BookCategoryMapper {
  public map(entity: BookCategoryEntity): BookCategory {
    const { id, createdAt, updatedAt, bookId, categoryId } = entity;

    return new BookCategory({
      id,
      createdAt,
      updatedAt,
      bookId,
      categoryId,
    });
  }
}
