import { DeleteBookCategoryCommandHandler } from './deleteBookCategoryCommandHandler';
import {
  DeleteBookCategoryCommandHandlerPayload,
  deleteBookCategoryCommandHandlerPayloadSchema,
} from './payloads/deleteBookCategoryCommandHandlerPayload';
import { Injectable, Inject } from '../../../../../../libs/dependencyInjection/decorators';
import { loggerModuleSymbols } from '../../../../../../libs/logger/loggerModuleSymbols';
import { LoggerService } from '../../../../../../libs/logger/services/loggerService/loggerService';
import { Validator } from '../../../../../../libs/validator/validator';
import { bookCategorySymbols } from '../../../symbols';
import { BookCategoryNotFoundError } from '../../errors/bookCategoryNotFoundError';
import { BookCategoryRepositoryFactory } from '../../repositories/bookCategoryRepository/bookCategoryRepositoryFactory';

@Injectable()
export class DeleteBookCategoryCommandHandlerImpl implements DeleteBookCategoryCommandHandler {
  public constructor(
    @Inject(bookCategorySymbols.bookCategoryRepositoryFactory)
    private readonly bookCategoryRepositoryFactory: BookCategoryRepositoryFactory,
    @Inject(loggerModuleSymbols.loggerService)
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(input: DeleteBookCategoryCommandHandlerPayload): Promise<void> {
    const { unitOfWork, bookId, categoryId } = Validator.validate(deleteBookCategoryCommandHandlerPayloadSchema, input);

    this.loggerService.debug({ message: 'Deleting bookCategory...', context: { bookId, categoryId } });

    const entityManager = unitOfWork.getEntityManager();

    const bookCategoryRepository = this.bookCategoryRepositoryFactory.create(entityManager);

    const bookCategory = await bookCategoryRepository.findBookCategory({ bookId, categoryId });

    if (!bookCategory) {
      throw new BookCategoryNotFoundError({ bookId, categoryId });
    }

    await bookCategoryRepository.deleteBookCategory({ id: bookCategory.id });

    this.loggerService.info({ message: 'BookCategory deleted.', context: { bookCategoryId: bookCategory.id } });
  }
}
