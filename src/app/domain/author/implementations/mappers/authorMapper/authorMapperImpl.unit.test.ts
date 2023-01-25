import { describe, it, beforeAll, expect } from 'vitest';

import { AuthorMapperImpl } from './authorMapperImpl';
import { AuthorEntityTestFactory } from '../../../tests/factories/authorEntityTestFactory/authorEntityTestFactory';

describe('AuthorMapperImpl', () => {
  let authorMapperImpl: AuthorMapperImpl;
  let authorEntityTestFactory: AuthorEntityTestFactory;

  beforeAll(async () => {
    authorEntityTestFactory = new AuthorEntityTestFactory();
    authorMapperImpl = new AuthorMapperImpl();
  });

  it('map author entity to author', async () => {
    expect.assertions(1);

    const authorEntity = authorEntityTestFactory.create();

    const author = authorMapperImpl.map(authorEntity);

    expect(author).toEqual({
      id: authorEntity.id,
      createdAt: authorEntity.createdAt,
      updatedAt: authorEntity.updatedAt,
      firstName: authorEntity.firstName,
      lastName: authorEntity.lastName,
      about: authorEntity.about,
    });
  });
});
