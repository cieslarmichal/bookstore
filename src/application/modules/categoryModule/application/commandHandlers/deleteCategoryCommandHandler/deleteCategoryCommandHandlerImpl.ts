import { DeleteCategoryCommandHandler } from './deleteCategoryCommandHandler';
import {
  DeleteCategoryCommandHandlerPayload,
  deleteCategoryCommandHandlerPayloadSchema,
} from './payloads/deleteCategoryCommandHandlerPayload';
import { Injectable, Inject } from '../../../../../../libs/dependencyInjection/decorators';
import { loggerModuleSymbols } from '../../../../../../libs/logger/loggerModuleSymbols';
import { LoggerService } from '../../../../../../libs/logger/services/loggerService/loggerService';
import { Validator } from '../../../../../../libs/validator/validator';
import { categorySymbols } from '../../../symbols';
import { CategoryRepositoryFactory } from '../../repositories/categoryRepository/categoryRepositoryFactory';

@Injectable()
export class DeleteCategoryCommandHandlerImpl implements DeleteCategoryCommandHandler {
  public constructor(
    @Inject(categorySymbols.categoryRepositoryFactory)
    private readonly categoryRepositoryFactory: CategoryRepositoryFactory,
    @Inject(loggerModuleSymbols.loggerService)
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(input: DeleteCategoryCommandHandlerPayload): Promise<void> {
    const { unitOfWork, categoryId } = Validator.validate(deleteCategoryCommandHandlerPayloadSchema, input);

    this.loggerService.debug({ message: 'Deleting category...', context: { categoryId } });

    const entityManager = unitOfWork.getEntityManager();

    const categoryRepository = this.categoryRepositoryFactory.create(entityManager);

    await categoryRepository.deleteCategory({ id: categoryId });

    this.loggerService.info({ message: 'Category deleted.', context: { categoryId } });
  }
}
