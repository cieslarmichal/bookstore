import { LoggerService } from '../../../shared/logger/services/loggerService';
import { CategoryDto } from '../dtos';
import { CategoryAlreadyExists, CategoryNotFound } from '../errors';
import { CategoryRepository } from '../repositories/categoryRepository';
import { CreateCategoryData } from './types';

export class CategoryService {
  public constructor(
    private readonly categoryRepository: CategoryRepository,
    private readonly loggerService: LoggerService,
  ) {}

  public async createCategory(categoryData: CreateCategoryData): Promise<CategoryDto> {
    const { name } = categoryData;

    this.loggerService.debug('Creating category...', { name });

    const existingCategory = await this.categoryRepository.findOne({ name });

    if (existingCategory) {
      throw new CategoryAlreadyExists({ name });
    }

    const category = await this.categoryRepository.createOne(categoryData);

    this.loggerService.info('Category created.', { categoryId: category.id });

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
    this.loggerService.debug('Removing category...', { categoryId });

    await this.categoryRepository.removeOne(categoryId);

    this.loggerService.info('Category removed.', { categoryId });
  }
}
