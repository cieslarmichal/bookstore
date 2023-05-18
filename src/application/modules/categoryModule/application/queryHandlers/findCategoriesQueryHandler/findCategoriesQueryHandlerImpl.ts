import { FindCategoriesQueryHandler } from './findCategoriesQueryHandler';
import {
  FindCategoriesQueryHandlerPayload,
  findCategoriesQueryHandlerPayloadSchema,
} from './payloads/findCategoriesQueryHandlerPayload';
import {
  FindCategoriesQueryHandlerResult,
  findCategoriesQueryHandlerResultSchema,
} from './payloads/findCategoriesQueryHandlerResult';
import { Injectable, Inject } from '../../../../../../libs/dependencyInjection/decorators';
import { Validator } from '../../../../../../libs/validator/validator';
import { categorySymbols } from '../../../symbols';
import { CategoryRepositoryFactory } from '../../repositories/categoryRepository/categoryRepositoryFactory';
import { FindCategoriesPayload } from '../../repositories/categoryRepository/payloads/findCategoriesPayload';

@Injectable()
export class FindCategoriesQueryHandlerImpl implements FindCategoriesQueryHandler {
  public constructor(
    @Inject(categorySymbols.categoryRepositoryFactory)
    private readonly categoryRepositoryFactory: CategoryRepositoryFactory,
  ) {}

  public async execute(input: FindCategoriesQueryHandlerPayload): Promise<FindCategoriesQueryHandlerResult> {
    const { unitOfWork, filters, pagination, bookId } = Validator.validate(
      findCategoriesQueryHandlerPayloadSchema,
      input,
    );

    const entityManager = unitOfWork.getEntityManager();

    const categoryRepository = this.categoryRepositoryFactory.create(entityManager);

    let findCategoriesPayload: FindCategoriesPayload = { filters, pagination };

    if (bookId) {
      findCategoriesPayload = { ...findCategoriesPayload, bookId };
    }

    const categories = await categoryRepository.findCategories(findCategoriesPayload);

    return Validator.validate(findCategoriesQueryHandlerResultSchema, { categories });
  }
}
