import { FindCategoryQueryHandler } from './findCategoryQueryHandler';
import {
  FindCategoryQueryHandlerPayload,
  findCategoryQueryHandlerPayloadSchema,
} from './payloads/findCategoryQueryHandlerPayload';
import {
  FindCategoryQueryHandlerResult,
  findCategoryQueryHandlerResultSchema,
} from './payloads/findCategoryQueryHandlerResult';
import { Injectable, Inject } from '../../../../../../libs/dependencyInjection/decorators';
import { Validator } from '../../../../../../libs/validator/validator';
import { CategoryNotFoundError } from '../../errors/categoryNotFoundError';
import { categorySymbols } from '../../../symbols';
import { CategoryRepositoryFactory } from '../../repositories/categoryRepository/categoryRepositoryFactory';

@Injectable()
export class FindCategoryQueryHandlerImpl implements FindCategoryQueryHandler {
  public constructor(
    @Inject(categorySymbols.categoryRepositoryFactory)
    private readonly categoryRepositoryFactory: CategoryRepositoryFactory,
  ) {}

  public async execute(input: FindCategoryQueryHandlerPayload): Promise<FindCategoryQueryHandlerResult> {
    const { unitOfWork, categoryId } = Validator.validate(findCategoryQueryHandlerPayloadSchema, input);

    const entityManager = unitOfWork.getEntityManager();

    const categoryRepository = this.categoryRepositoryFactory.create(entityManager);

    const category = await categoryRepository.findCategory({ id: categoryId });

    if (!category) {
      throw new CategoryNotFoundError({ id: categoryId });
    }

    return Validator.validate(findCategoryQueryHandlerResultSchema, { category });
  }
}
