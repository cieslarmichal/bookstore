import { CategoryMapperImpl } from './categoryMapperImpl';
import { CategoryEntityTestFactory } from '../../../tests/factories/categoryEntityTestFactory/categoryEntityTestFactory';

describe('CategoryMapperImpl', () => {
  let categoryMapperImpl: CategoryMapperImpl;
  let categoryEntityTestFactory: CategoryEntityTestFactory;

  beforeAll(async () => {
    categoryEntityTestFactory = new CategoryEntityTestFactory();
    categoryMapperImpl = new CategoryMapperImpl();
  });

  it('maps a category entity to a category', async () => {
    expect.assertions(1);

    const categoryEntity = categoryEntityTestFactory.create();

    const category = categoryMapperImpl.map(categoryEntity);

    expect(category).toStrictEqual({
      id: categoryEntity.id,
      createdAt: categoryEntity.createdAt,
      updatedAt: categoryEntity.updatedAt,
      name: categoryEntity.name,
    });
  });
});
