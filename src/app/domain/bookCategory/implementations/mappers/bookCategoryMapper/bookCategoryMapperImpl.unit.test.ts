import { describe, it, beforeAll, expect } from 'vitest';

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

    expect(bookCategory).toStrictEqual({
      id: bookCategoryEntity.id,
      createdAt: bookCategoryEntity.createdAt,
      updatedAt: bookCategoryEntity.updatedAt,
      bookId: bookCategoryEntity.id,
      categoryId: bookCategoryEntity.id,
    });
  });
});