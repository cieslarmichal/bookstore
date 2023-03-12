import { CategoryService } from './categoryService';
import { CreateCategoryPayload, createCategoryPayloadSchema } from './createCategoryPayload';
import { DeleteCategoryPayload, deleteCategoryPayloadSchema } from './payloads/deleteCategoryPayload';
import {
  FindCategoriesByBookIdPayload,
  findCategoriesByBookIdPayloadSchema,
} from './payloads/findCategoriesByBookIdPayload';
import { FindCategoriesPayload, findCategoriesPayloadSchema } from './payloads/findCategoriesPayload';
import { FindCategoryPayload, findCategoryPayloadSchema } from './payloads/findCategoryPayload';
import { Injectable, Inject } from '../../../../../libs/dependencyInjection/decorators';
import { LoggerService } from '../../../../../libs/logger/contracts/services/loggerService/loggerService';
import { loggerModuleSymbols } from '../../../../../libs/logger/loggerModuleSymbols';
import { UuidGenerator } from '../../../../../libs/uuid/uuidGenerator';
import { Validator } from '../../../../../libs/validator/implementations/validator';
import { categoryModuleSymbols } from '../../../categoryModuleSymbols';
import { Category } from '../../../domain/entities/category/category';
import { CategoryAlreadyExistsError } from '../../../infrastructure/errors/categoryAlreadyExistsError';
import { CategoryNotFoundError } from '../../../infrastructure/errors/categoryNotFoundError';
import { CategoryRepositoryFactory } from '../../repositories/categoryRepository/categoryRepositoryFactory';

@Injectable()
export class CategoryServiceImpl implements CategoryService {
  public constructor(
    @Inject(categoryModuleSymbols.categoryRepositoryFactory)
    private readonly categoryRepositoryFactory: CategoryRepositoryFactory,
    @Inject(loggerModuleSymbols.loggerService)
    private readonly loggerService: LoggerService,
  ) {}

  public async createCategory(input: CreateCategoryPayload): Promise<Category> {
    const {
      unitOfWork,
      draft: { name },
    } = Validator.validate(createCategoryPayloadSchema, input);

    this.loggerService.debug({ message: 'Creating category...', context: { name } });

    const entityManager = unitOfWork.getEntityManager();

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
    const { unitOfWork, categoryId } = Validator.validate(findCategoryPayloadSchema, input);

    const entityManager = unitOfWork.getEntityManager();

    const categoryRepository = this.categoryRepositoryFactory.create(entityManager);

    const category = await categoryRepository.findOne({ id: categoryId });

    if (!category) {
      throw new CategoryNotFoundError({ id: categoryId });
    }

    return category;
  }

  public async findCategories(input: FindCategoriesPayload): Promise<Category[]> {
    const { unitOfWork, filters, pagination } = Validator.validate(findCategoriesPayloadSchema, input);

    const entityManager = unitOfWork.getEntityManager();

    const categoryRepository = this.categoryRepositoryFactory.create(entityManager);

    const categories = await categoryRepository.findMany({ filters, pagination });

    return categories;
  }

  public async findCategoriesByBookId(input: FindCategoriesByBookIdPayload): Promise<Category[]> {
    const { unitOfWork, filters, pagination, bookId } = Validator.validate(findCategoriesByBookIdPayloadSchema, input);

    const entityManager = unitOfWork.getEntityManager();

    const categoryRepository = this.categoryRepositoryFactory.create(entityManager);

    const categories = await categoryRepository.findMany({ bookId, filters, pagination });

    return categories;
  }

  public async deleteCategory(input: DeleteCategoryPayload): Promise<void> {
    const { unitOfWork, categoryId } = Validator.validate(deleteCategoryPayloadSchema, input);

    this.loggerService.debug({ message: 'Deleting category...', context: { categoryId } });

    const entityManager = unitOfWork.getEntityManager();

    const categoryRepository = this.categoryRepositoryFactory.create(entityManager);

    await categoryRepository.deleteOne({ id: categoryId });

    this.loggerService.info({ message: 'Category deleted.', context: { categoryId } });
  }
}
