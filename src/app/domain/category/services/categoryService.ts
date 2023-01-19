import { Filter, PostgresUnitOfWork } from '../../../common';
import { LoggerService } from '../../../common/logger/services/loggerService';
import { PaginationData } from '../../common';
import { CategoryDto } from '../dtos';
import { CategoryAlreadyExists, CategoryNotFound } from '../errors';
import { CategoryRepositoryFactory } from '../repositories/categoryRepositoryFactory';
import { CreateCategoryData } from './types';

export class CategoryService {
  public constructor(
    private readonly categoryRepositoryFactory: CategoryRepositoryFactory,
    private readonly loggerService: LoggerService,
  ) {}

  public async createCategory(unitOfWork: PostgresUnitOfWork, categoryData: CreateCategoryData): Promise<CategoryDto> {
    const { name } = categoryData;

    this.loggerService.debug('Creating category...', { name });

    const { entityManager } = unitOfWork;

    const categoryRepository = this.categoryRepositoryFactory.create(entityManager);

    const existingCategory = await categoryRepository.findOne({ name });

    if (existingCategory) {
      throw new CategoryAlreadyExists({ name });
    }

    const category = await categoryRepository.createOne(categoryData);

    this.loggerService.info('Category created.', { categoryId: category.id });

    return category;
  }

  public async findCategory(unitOfWork: PostgresUnitOfWork, categoryId: string): Promise<CategoryDto> {
    const { entityManager } = unitOfWork;

    const categoryRepository = this.categoryRepositoryFactory.create(entityManager);

    const category = await categoryRepository.findOneById(categoryId);

    if (!category) {
      throw new CategoryNotFound({ id: categoryId });
    }

    return category;
  }

  public async findCategories(
    unitOfWork: PostgresUnitOfWork,
    filters: Filter[],
    paginationData: PaginationData,
  ): Promise<CategoryDto[]> {
    const { entityManager } = unitOfWork;

    const categoryRepository = this.categoryRepositoryFactory.create(entityManager);

    const categories = await categoryRepository.findMany(filters, paginationData);

    return categories;
  }

  public async findCategoriesByBookId(
    unitOfWork: PostgresUnitOfWork,
    bookId: string,
    filters: Filter[],
    paginationData: PaginationData,
  ): Promise<CategoryDto[]> {
    const { entityManager } = unitOfWork;

    const categoryRepository = this.categoryRepositoryFactory.create(entityManager);

    const categories = await categoryRepository.findManyByBookId(bookId, filters, paginationData);

    return categories;
  }

  public async removeCategory(unitOfWork: PostgresUnitOfWork, categoryId: string): Promise<void> {
    this.loggerService.debug('Removing category...', { categoryId });

    const { entityManager } = unitOfWork;

    const categoryRepository = this.categoryRepositoryFactory.create(entityManager);

    await categoryRepository.removeOne(categoryId);

    this.loggerService.info('Category removed.', { categoryId });
  }
}
