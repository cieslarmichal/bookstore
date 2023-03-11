import { Injectable } from '../../../../../../libs/dependencyInjection/contracts/decorators';
import { BookCategory } from '../../../contracts/bookCategory';
import { BookCategoryEntity } from '../../../contracts/bookCategoryEntity';
import { BookCategoryMapper } from '../../../contracts/mappers/bookCategoryMapper/bookCategoryMapper';

@Injectable()
export class BookCategoryMapperImpl implements BookCategoryMapper {
  public map({ id, bookId, categoryId }: BookCategoryEntity): BookCategory {
    return new BookCategory({
      id,
      bookId,
      categoryId,
    });
  }
}
