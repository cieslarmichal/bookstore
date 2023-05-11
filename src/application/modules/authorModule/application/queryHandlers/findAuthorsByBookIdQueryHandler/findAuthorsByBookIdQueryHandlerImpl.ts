import { FindAuthorsByBookIdQueryHandler } from './findAuthorsByBookIdQueryHandler';
import {
  FindAuthorsByBookIdQueryHandlerPayload,
  findAuthorsByBookIdQueryHandlerPayloadSchema,
} from './payloads/findAuthorsByBookIdQueryHandlerPayload';
import {
  FindAuthorsByBookIdQueryHandlerResult,
  findAuthorsByBookIdQueryHandlerResultSchema,
} from './payloads/findAuthorsByBookIdQueryHandlerResult';
import { Injectable, Inject } from '../../../../../../libs/dependencyInjection/decorators';
import { Validator } from '../../../../../../libs/validator/validator';
import { authorSymbols } from '../../../symbols';
import { AuthorRepositoryFactory } from '../../repositories/authorRepository/authorRepositoryFactory';

@Injectable()
export class FindAuthorsByBookIdQueryHandlerImpl implements FindAuthorsByBookIdQueryHandler {
  public constructor(
    @Inject(authorSymbols.authorRepositoryFactory)
    private readonly authorRepositoryFactory: AuthorRepositoryFactory,
  ) {}

  public async execute(input: FindAuthorsByBookIdQueryHandlerPayload): Promise<FindAuthorsByBookIdQueryHandlerResult> {
    const { unitOfWork, filters, pagination, bookId } = Validator.validate(
      findAuthorsByBookIdQueryHandlerPayloadSchema,
      input,
    );

    const entityManager = unitOfWork.getEntityManager();

    const authorRepository = this.authorRepositoryFactory.create(entityManager);

    const authors = await authorRepository.findAuthors({ filters, pagination, bookId });

    return Validator.validate(findAuthorsByBookIdQueryHandlerResultSchema, { authors });
  }
}
