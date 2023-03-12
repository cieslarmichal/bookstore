import { CategoryMapper } from './categoryMapper';
import { Injectable } from '../../../../../../libs/dependencyInjection/decorators';
import { Category } from '../../../../domain/entities/category/category';
import { CategoryEntity } from '../categoryEntity/categoryEntity';

@Injectable()
export class CategoryMapperImpl implements CategoryMapper {
  public map({ id, name }: CategoryEntity): Category {
    return new Category({
      id,
      name,
    });
  }
}
