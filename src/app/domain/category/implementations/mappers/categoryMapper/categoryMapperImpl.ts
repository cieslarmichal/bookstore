import { CategoryEntity } from '../../../contracts/categoryEntity';
import { Category } from '../../../contracts/category';
import { CategoryMapper } from '../../../contracts/mappers/categoryMapper/categoryMapper';

export class CategoryMapperImpl implements CategoryMapper {
  public map(entity: CategoryEntity): Category {
    const { id, createdAt, updatedAt, name } = entity;

    return Category.create({
      id,
      createdAt,
      updatedAt,
      name,
    });
  }
}
