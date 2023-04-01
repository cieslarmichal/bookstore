import { BookCategoryMapper } from './bookCategoryMapper';
import { Injectable } from '../../../../../../../libs/dependencyInjection/decorators';
import { BookCategory } from '../../../../domain/entities/bookCategory/bookCategory';
import { BookCategoryEntity } from '../bookCategoryEntity/bookCategoryEntity';

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
