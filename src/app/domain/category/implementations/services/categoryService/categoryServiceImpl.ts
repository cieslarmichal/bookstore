import { LoggerService } from '../../../../../libs/logger/contracts/services/loggerService/loggerService';
import { UuidGenerator } from '../../../../../libs/uuid/implementations/uuidGenerator';
import { Category } from '../../../contracts/category';
import { CategoryRepositoryFactory } from '../../../contracts/factories/categoryRepositoryFactory/categoryRepositoryFactory';
import { CategoryService } from '../../../contracts/services/categoryService/categoryService';
import { CreateCategoryPayload } from '../../../contracts/services/categoryService/createCategoryPayload';
import { DeleteCategoryPayload } from '../../../contracts/services/categoryService/deleteCategoryPayload';
import { FindCategoriesByBookIdPayload } from '../../../contracts/services/categoryService/findCategoriesByBookIdPayload';
import { FindCategoriesPayload } from '../../../contracts/services/categoryService/findCategoriesPayload';
import { FindCategoryPayload } from '../../../contracts/services/categoryService/findCategoryPayload';
import { CategoryAlreadyExistsError } from '../../../errors/categoryAlreadyExistsError';
import { CategoryNotFoundError } from '../../../errors/categoryNotFoundError';

export class CategoryServiceImpl implements CategoryService {
  public constructor(
    private readonly categoryRepositoryFactory: CategoryRepositoryFactory,
    private readonly loggerService: LoggerService,
  ) {}

  public async createCategory(input: CreateCategoryPayload): Promise<Category> {
    const {
      unitOfWork,
      draft: { name },
    } = input;

    this.loggerService.debug({ message: 'Creating category...', context: { name } });

    const { entityManager } = unitOfWork;

    const categoryRepository = this.categoryRepositoryFactory.create(entityManager);

    const existingCategory = await categoryRepository.findOne({ name });

    if (existingCategory) {
      throw new CategoryAlreadyExistsError({ name });
    }

    const category = await categoryRepository.createOne({ id: UuidGenerator.generateUuid(), name });

    this.loggerService.info({ message: 'Category created.', context: { categoryId: category.id } });

    return category;
  }

  public async findCategory(input: FindCategoryPayload): Promise<Category> {
    const { unitOfWork, categoryId } = input;

    const { entityManager } = unitOfWork;

    const categoryRepository = this.categoryRepositoryFactory.create(entityManager);

    const category = await categoryRepository.findOne({ id: categoryId });

    if (!category) {
      throw new CategoryNotFoundError({ id: categoryId });
    }

    return category;
  }

  public async findCategories(input: FindCategoriesPayload): Promise<Category[]> {
    const { unitOfWork, filters, pagination } = input;

    const { entityManager } = unitOfWork;

    const categoryRepository = this.categoryRepositoryFactory.create(entityManager);

    const categories = await categoryRepository.findMany({ filters, pagination });

    return categories;
  }

  public async findCategoriesByBookId(input: FindCategoriesByBookIdPayload): Promise<Category[]> {
    const { unitOfWork, filters, pagination, bookId } = input;

    const { entityManager } = unitOfWork;

    const categoryRepository = this.categoryRepositoryFactory.create(entityManager);

    const categories = await categoryRepository.findMany({ bookId, filters, pagination });

    return categories;
  }

  public async deleteCategory(input: DeleteCategoryPayload): Promise<void> {
    const { unitOfWork, categoryId } = input;

    this.loggerService.debug({ message: 'Deleting category...', context: { categoryId } });

    const { entityManager } = unitOfWork;

    const categoryRepository = this.categoryRepositoryFactory.create(entityManager);

    await categoryRepository.deleteOne({ id: categoryId });

    this.loggerService.info({ message: 'Category deleted.', context: { categoryId } });
  }
}
