import { FindBooksQueryHandler } from './findBooksQueryHandler';
import {
  FindBooksQueryHandlerPayload,
  findBooksQueryHandlerPayloadSchema,
} from './payloads/findBooksQueryHandlerPayload';
import { FindBooksQueryHandlerResult, findBooksQueryHandlerResultSchema } from './payloads/findBooksQueryHandlerResult';
import { Injectable, Inject } from '../../../../../../libs/dependencyInjection/decorators';
import { Validator } from '../../../../../../libs/validator/validator';
import { bookSymbols } from '../../../symbols';
import { BookRepositoryFactory } from '../../repositories/bookRepository/bookRepositoryFactory';
import { FindBooksPayload } from '../../repositories/bookRepository/payloads/findBooksPayload';

@Injectable()
export class FindBooksQueryHandlerImpl implements FindBooksQueryHandler {
  public constructor(
    @Inject(bookSymbols.bookRepositoryFactory)
    private readonly bookRepositoryFactory: BookRepositoryFactory,
  ) {}

  public async execute(input: FindBooksQueryHandlerPayload): Promise<FindBooksQueryHandlerResult> {
    const { unitOfWork, filters, pagination, authorId, categoryId } = Validator.validate(
      findBooksQueryHandlerPayloadSchema,
      input,
    );

    const entityManager = unitOfWork.getEntityManager();

    const bookRepository = this.bookRepositoryFactory.create(entityManager);

    let findBooksPayload: FindBooksPayload = {
      filters,
      pagination,
    };

    if (authorId) {
      findBooksPayload = { ...findBooksPayload, authorId };
    }

    if (categoryId) {
      findBooksPayload = { ...findBooksPayload, categoryId };
    }

    const books = await bookRepository.findBooks(findBooksPayload);

    return Validator.validate(findBooksQueryHandlerResultSchema, { books });
  }
}
