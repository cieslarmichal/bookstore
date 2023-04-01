import 'reflect-metadata';

import { AuthorMapperImpl } from './authorMapperImpl';
import { AuthorEntityTestFactory } from '../../../../tests/factories/authorEntityTestFactory/authorEntityTestFactory';

describe('AuthorMapperImpl', () => {
  let authorMapperImpl: AuthorMapperImpl;

  const authorEntityTestFactory = new AuthorEntityTestFactory();

  beforeAll(async () => {
    authorMapperImpl = new AuthorMapperImpl();
  });

  it('map author entity to author', async () => {
    expect.assertions(1);

    const authorEntity = authorEntityTestFactory.create();

    const author = authorMapperImpl.map(authorEntity);

    expect(author).toEqual({
      id: authorEntity.id,
      firstName: authorEntity.firstName,
      lastName: authorEntity.lastName,
      about: authorEntity.about,
    });
  });
});
