import { Filter } from '../../../../../common/filter/filter';
import { LoggerService } from '../../../../../libs/logger/loggerService';
import { PostgresUnitOfWork } from '../../../../../libs/unitOfWork/postgresUnitOfWork';
import { PaginationData } from '../../../../common/paginationData';
import { Category } from '../../../contracts/category';
import { CategoryRepositoryFactory } from '../../../contracts/factories/categoryRepositoryFactory/categoryRepositoryFactory';
import { CategoryService } from '../../../contracts/services/categoryService/categoryService';
import { CreateCategoryData } from '../../../contracts/services/categoryService/createCategoryData';
import { CategoryAlreadyExistsError } from '../../../errors/categoryAlreadyExistsError';
import { CategoryNotFoundError } from '../../../errors/categoryNotFoundError';

export class CategoryServiceImpl implements CategoryService {
  public constructor(
    private readonly categoryRepositoryFactory: CategoryRepositoryFactory,
    private readonly loggerService: LoggerService,
  ) {}

  public async createCategory(unitOfWork: PostgresUnitOfWork, categoryData: CreateCategoryData): Promise<Category> {
    const { name } = categoryData;

    this.loggerService.debug('Creating category...', { name });

    const { entityManager } = unitOfWork;

    const categoryRepository = this.categoryRepositoryFactory.create(entityManager);

    const existingCategory = await categoryRepository.findOne({ name });

    if (existingCategory) {
      throw new CategoryAlreadyExistsError({ name });
    }

    const category = await categoryRepository.createOne(categoryData);

    this.loggerService.info('Category created.', { categoryId: category.id });

    return category;
  }

  public async findCategory(unitOfWork: PostgresUnitOfWork, categoryId: string): Promise<Category> {
    const { entityManager } = unitOfWork;

    const categoryRepository = this.categoryRepositoryFactory.create(entityManager);

    const category = await categoryRepository.findOneById(categoryId);

    if (!category) {
      throw new CategoryNotFoundError({ id: categoryId });
    }

    return category;
  }

  public async findCategories(
    unitOfWork: PostgresUnitOfWork,
    filters: Filter[],
    pagination: PaginationData,
  ): Promise<Category[]> {
    const { entityManager } = unitOfWork;

    const categoryRepository = this.categoryRepositoryFactory.create(entityManager);

    const categories = await categoryRepository.findMany(filters, pagination);

    return categories;
  }

  public async findCategoriesByBookId(
    unitOfWork: PostgresUnitOfWork,
    bookId: string,
    filters: Filter[],
    pagination: PaginationData,
  ): Promise<Category[]> {
    const { entityManager } = unitOfWork;

    const categoryRepository = this.categoryRepositoryFactory.create(entityManager);

    const categories = await categoryRepository.findManyByBookId(bookId, filters, pagination);

    return categories;
  }

  public async removeCategory(unitOfWork: PostgresUnitOfWork, categoryId: string): Promise<void> {
    this.loggerService.debug('Removing category...', { categoryId });

    const { entityManager } = unitOfWork;

    const categoryRepository = this.categoryRepositoryFactory.create(entityManager);

    await categoryRepository.deleteOne(categoryId);

    this.loggerService.info('Category removed.', { categoryId });
  }
}
