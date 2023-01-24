import { Category } from '../../../contracts/category';
import { CategoryEntity } from '../../../contracts/categoryEntity';
import { CategoryMapper } from '../../../contracts/mappers/categoryMapper/categoryMapper';

export class CategoryMapperImpl implements CategoryMapper {
  public map(entity: CategoryEntity): Category {
    const { id, createdAt, updatedAt, name } = entity;

    return new Category({
      id,
      createdAt,
      updatedAt,
      name,
    });
  }
}
