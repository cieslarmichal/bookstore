import { Injectable } from '../../../../../libs/dependencyInjection/contracts/decorators';
import { BookCategory } from '../../../contracts/bookCategory';
import { BookCategoryEntity } from '../../../contracts/bookCategoryEntity';
import { BookCategoryMapper } from '../../../contracts/mappers/bookCategoryMapper/bookCategoryMapper';

@Injectable()
export class BookCategoryMapperImpl implements BookCategoryMapper {
  public map(entity: BookCategoryEntity): BookCategory {
    const { id, bookId, categoryId } = entity;

    return new BookCategory({
      id,
      bookId,
      categoryId,
    });
  }
}
