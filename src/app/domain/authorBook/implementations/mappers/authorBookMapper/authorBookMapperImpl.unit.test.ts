import { describe, it, beforeAll, expect } from 'vitest';

import { AuthorBookMapperImpl } from './authorBookMapperImpl';
import { AuthorBookEntityTestFactory } from '../../../tests/factories/authorBookEntityTestFactory/authorBookEntityTestFactory';

describe('AuthorBookMapperImpl', () => {
  let authorBookMapperImpl: AuthorBookMapperImpl;
  let authorBookEntityTestFactory: AuthorBookEntityTestFactory;

  beforeAll(async () => {
    authorBookEntityTestFactory = new AuthorBookEntityTestFactory();
    authorBookMapperImpl = new AuthorBookMapperImpl();
  });

  it('map author book entity to author book', async () => {
    expect.assertions(1);

    const authorBookEntity = authorBookEntityTestFactory.create();

    const authorBook = authorBookMapperImpl.map(authorBookEntity);

    expect(authorBook).toEqual({
      id: authorBookEntity.id,
      createdAt: authorBookEntity.createdAt,
      updatedAt: authorBookEntity.updatedAt,
      authorId: authorBookEntity.id,
      bookId: authorBookEntity.id,
    });
  });
});
