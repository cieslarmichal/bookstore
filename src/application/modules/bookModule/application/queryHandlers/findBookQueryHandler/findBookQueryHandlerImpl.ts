import { FindBookQueryHandler } from './findBookQueryHandler';
import { FindBookQueryHandlerPayload, findBookQueryHandlerPayloadSchema } from './payloads/findBookQueryHandlerPayload';
import { FindBookQueryHandlerResult, findBookQueryHandlerResultSchema } from './payloads/findBookQueryHandlerResult';
import { Injectable, Inject } from '../../../../../../libs/dependencyInjection/decorators';
import { Validator } from '../../../../../../libs/validator/validator';
import { bookSymbols } from '../../../symbols';
import { BookNotFoundError } from '../../errors/bookNotFoundError';
import { BookRepositoryFactory } from '../../repositories/bookRepository/bookRepositoryFactory';

@Injectable()
export class FindBookQueryHandlerImpl implements FindBookQueryHandler {
  public constructor(
    @Inject(bookSymbols.bookRepositoryFactory)
    private readonly bookRepositoryFactory: BookRepositoryFactory,
  ) {}

  public async execute(input: FindBookQueryHandlerPayload): Promise<FindBookQueryHandlerResult> {
    const { unitOfWork, bookId } = Validator.validate(findBookQueryHandlerPayloadSchema, input);

    const entityManager = unitOfWork.getEntityManager();

    const bookRepository = this.bookRepositoryFactory.create(entityManager);

    const book = await bookRepository.findBook({ id: bookId });

    if (!book) {
      throw new BookNotFoundError({ id: bookId });
    }

    return Validator.validate(findBookQueryHandlerResultSchema, { book });
  }
}
