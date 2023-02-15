import 'reflect-metadata';

import { BookMapperImpl } from './bookMapperImpl';
import { BookEntityTestFactory } from '../../../tests/factories/bookEntityTestFactory/bookEntityTestFactory';

describe('BookMapperImpl', () => {
  let bookMapperImpl: BookMapperImpl;
  let bookEntityTestFactory: BookEntityTestFactory;

  beforeAll(async () => {
    bookEntityTestFactory = new BookEntityTestFactory();
    bookMapperImpl = new BookMapperImpl();
  });

  it('maps a book entity to a book', async () => {
    expect.assertions(1);

    const bookEntity = bookEntityTestFactory.create();

    const book = bookMapperImpl.map(bookEntity);

    expect(book).toEqual({
      id: bookEntity.id,
      title: bookEntity.title,
      isbn: bookEntity.isbn,
      releaseYear: bookEntity.releaseYear,
      language: bookEntity.language,
      format: bookEntity.format,
      description: bookEntity.description,
      price: bookEntity.price,
    });
  });
});
