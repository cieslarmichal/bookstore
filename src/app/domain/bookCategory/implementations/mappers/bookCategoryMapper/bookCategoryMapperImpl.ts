import { BookCategoryEntity } from '../../../contracts/bookCategoryEntity';
import { BookCategory } from '../../../contracts/bookCategory';
import { BookCategoryMapper } from '../../../contracts/mappers/bookCategoryMapper/bookCategoryMapper';

export class BookCategoryMapperImpl implements BookCategoryMapper {
  public map(entity: BookCategoryEntity): BookCategory {
    const { id, createdAt, updatedAt, bookId, categoryId } = entity;

    return BookCategory.create({
      id,
      createdAt,
      updatedAt,
      bookId,
      categoryId,
    });
  }
}
