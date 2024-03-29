import 'reflect-metadata';

import { AuthorBookMapperImpl } from './authorBookMapperImpl';
import { AuthorBookEntityTestFactory } from '../../../../tests/factories/authorBookEntityTestFactory/authorBookEntityTestFactory';

describe('AuthorBookMapperImpl', () => {
  let authorBookMapperImpl: AuthorBookMapperImpl;

  const authorBookEntityTestFactory = new AuthorBookEntityTestFactory();

  beforeAll(async () => {
    authorBookMapperImpl = new AuthorBookMapperImpl();
  });

  it('map author book entity to author book', async () => {
    expect.assertions(1);

    const authorBookEntity = authorBookEntityTestFactory.create();

    const authorBook = authorBookMapperImpl.map(authorBookEntity);

    expect(authorBook).toEqual({
      id: authorBookEntity.id,
      authorId: authorBookEntity.authorId,
      bookId: authorBookEntity.bookId,
    });
  });
});
