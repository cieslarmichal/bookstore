import { Mapper } from '../../../../../../../common/types/mapper';
import { Category } from '../../../../domain/entities/category/category';
import { CategoryEntity } from '../categoryEntity/categoryEntity';

export type CategoryMapper = Mapper<CategoryEntity, Category>;
