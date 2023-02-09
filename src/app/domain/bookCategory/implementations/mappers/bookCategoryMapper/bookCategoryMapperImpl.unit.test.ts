import 'reflect-metadata';

import { BookCategoryMapperImpl } from './bookCategoryMapperImpl';
import { BookCategoryEntityTestFactory } from '../../../tests/factories/bookCategoryEntityTestFactory/bookCategoryEntityTestFactory';

describe('BookCategoryMapperImpl', () => {
  let bookCategoryMapperImpl: BookCategoryMapperImpl;
  let bookCategoryEntityTestFactory: BookCategoryEntityTestFactory;

  beforeAll(async () => {
    bookCategoryEntityTestFactory = new BookCategoryEntityTestFactory();
    bookCategoryMapperImpl = new BookCategoryMapperImpl();
  });

  it('maps a book category entity to a book category', async () => {
    expect.assertions(1);

    const bookCategoryEntity = bookCategoryEntityTestFactory.create();

    const bookCategory = bookCategoryMapperImpl.map(bookCategoryEntity);

    expect(bookCategory).toEqual({
      id: bookCategoryEntity.id,
      bookId: bookCategoryEntity.bookId,
      categoryId: bookCategoryEntity.categoryId,
    });
  });
});
