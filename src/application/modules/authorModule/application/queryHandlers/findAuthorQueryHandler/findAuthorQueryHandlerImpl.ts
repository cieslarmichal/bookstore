import { FindAuthorQueryHandler } from './findAuthorQueryHandler';
import {
  FindAuthorQueryHandlerPayload,
  findAuthorQueryHandlerPayloadSchema,
} from './payloads/findAuthorQueryHandlerPayload';
import {
  FindAuthorQueryHandlerResult,
  findAuthorQueryHandlerResultSchema,
} from './payloads/findAuthorQueryHandlerResult';
import { Injectable, Inject } from '../../../../../../libs/dependencyInjection/decorators';
import { Validator } from '../../../../../../libs/validator/validator';
import { AuthorNotFoundError } from '../../errors/authorNotFoundError';
import { authorSymbols } from '../../../symbols';
import { AuthorRepositoryFactory } from '../../repositories/authorRepository/authorRepositoryFactory';

@Injectable()
export class FindAuthorQueryHandlerImpl implements FindAuthorQueryHandler {
  public constructor(
    @Inject(authorSymbols.authorRepositoryFactory)
    private readonly authorRepositoryFactory: AuthorRepositoryFactory,
  ) {}

  public async execute(input: FindAuthorQueryHandlerPayload): Promise<FindAuthorQueryHandlerResult> {
    const { unitOfWork, authorId } = Validator.validate(findAuthorQueryHandlerPayloadSchema, input);

    const entityManager = unitOfWork.getEntityManager();

    const authorRepository = this.authorRepositoryFactory.create(entityManager);

    const author = await authorRepository.findAuthor({ id: authorId });

    if (!author) {
      throw new AuthorNotFoundError({ id: authorId });
    }

    return Validator.validate(findAuthorQueryHandlerResultSchema, { author });
  }
}
