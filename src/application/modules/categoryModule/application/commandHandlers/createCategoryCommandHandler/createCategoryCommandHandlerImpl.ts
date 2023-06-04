import { CreateCategoryCommandHandler } from './createCategoryCommandHandler';
import {
  CreateCategoryCommandHandlerPayload,
  createCategoryCommandHandlerPayloadSchema,
} from './payloads/createCategoryCommandHandlerPayload';
import {
  CreateCategoryCommandHandlerResult,
  createCategoryCommandHandlerResultSchema,
} from './payloads/createCategoryCommandHandlerResult';
import { Injectable, Inject } from '../../../../../../libs/dependencyInjection/decorators';
import { loggerModuleSymbols } from '../../../../../../libs/logger/loggerModuleSymbols';
import { LoggerService } from '../../../../../../libs/logger/services/loggerService/loggerService';
import { UuidGenerator } from '../../../../../../libs/uuid/uuidGenerator';
import { Validator } from '../../../../../../libs/validator/validator';
import { CategoryAlreadyExistsError } from '../../errors/categoryAlreadyExistsError';
import { categorySymbols } from '../../../symbols';
import { CategoryRepositoryFactory } from '../../repositories/categoryRepository/categoryRepositoryFactory';

@Injectable()
export class CreateCategoryCommandHandlerImpl implements CreateCategoryCommandHandler {
  public constructor(
    @Inject(categorySymbols.categoryRepositoryFactory)
    private readonly categoryRepositoryFactory: CategoryRepositoryFactory,
    @Inject(loggerModuleSymbols.loggerService)
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(input: CreateCategoryCommandHandlerPayload): Promise<CreateCategoryCommandHandlerResult> {
    const {
      unitOfWork,
      draft: { name },
    } = Validator.validate(createCategoryCommandHandlerPayloadSchema, input);

    this.loggerService.debug({ message: 'Creating category...', context: { name } });

    const entityManager = unitOfWork.getEntityManager();

    const categoryRepository = this.categoryRepositoryFactory.create(entityManager);

    const existingCategory = await categoryRepository.findCategory({ name });

    if (existingCategory) {
      throw new CategoryAlreadyExistsError({ name });
    }

    const category = await categoryRepository.createCategory({ id: UuidGenerator.generateUuid(), name });

    this.loggerService.info({ message: 'Category created.', context: { categoryId: category.id } });

    return Validator.validate(createCategoryCommandHandlerResultSchema, { category });
  }
}
