import { Injectable } from '../../../../../libs/dependencyInjection/contracts/decorators';
import { Category } from '../../../contracts/category';
import { CategoryEntity } from '../../../contracts/categoryEntity';
import { CategoryMapper } from '../../../contracts/mappers/categoryMapper/categoryMapper';

@Injectable()
export class CategoryMapperImpl implements CategoryMapper {
  public map(entity: CategoryEntity): Category {
    const { id, name } = entity;

    return new Category({
      id,
      name,
    });
  }
}
