import { CategoryDto } from '../dtos';
import { CategoryAlreadyExists, CategoryNotFound } from '../errors';
import { CategoryRepository } from '../repositories/categoryRepository';
import { CreateCategoryData } from './types';

export class CategoryService {
  public constructor(private readonly categoryRepository: CategoryRepository) {}

  public async createCategory(categoryData: CreateCategoryData): Promise<CategoryDto> {
    console.log('Creating category...');

    const { name } = categoryData;

    const existingCategory = await this.categoryRepository.findOne({ name });

    if (existingCategory) {
      throw new CategoryAlreadyExists({ name });
    }

    const category = await this.categoryRepository.createOne(categoryData);

    console.log('Category created.');

    return category;
  }

  public async findCategory(categoryId: string): Promise<CategoryDto> {
    const category = await this.categoryRepository.findOneById(categoryId);

    if (!category) {
      throw new CategoryNotFound({ id: categoryId });
    }

    return category;
  }

  public async removeCategory(categoryId: string): Promise<void> {
    console.log(`Removing category with id ${categoryId}...`);

    await this.categoryRepository.removeOne(categoryId);

    console.log(`Category with id ${categoryId} removed.`);
  }
}
