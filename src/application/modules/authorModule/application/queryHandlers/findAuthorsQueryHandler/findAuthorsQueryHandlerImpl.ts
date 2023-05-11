import { FindAuthorsQueryHandler } from './findAuthorsQueryHandler';
import {
  FindAuthorsQueryHandlerPayload,
  findAuthorsQueryHandlerPayloadSchema,
} from './payloads/findAuthorsQueryHandlerPayload';
import {
  FindAuthorsQueryHandlerResult,
  findAuthorsQueryHandlerResultSchema,
} from './payloads/findAuthorsQueryHandlerResult';
import { Injectable, Inject } from '../../../../../../libs/dependencyInjection/decorators';
import { Validator } from '../../../../../../libs/validator/validator';
import { symbols } from '../../../symbols';
import { AuthorRepositoryFactory } from '../../repositories/authorRepository/authorRepositoryFactory';

@Injectable()
export class FindAuthorsQueryHandlerImpl implements FindAuthorsQueryHandler {
  public constructor(
    @Inject(symbols.authorRepositoryFactory)
    private readonly authorRepositoryFactory: AuthorRepositoryFactory,
  ) {}

  public async execute(input: FindAuthorsQueryHandlerPayload): Promise<FindAuthorsQueryHandlerResult> {
    const { unitOfWork, filters, pagination } = Validator.validate(findAuthorsQueryHandlerPayloadSchema, input);

    const entityManager = unitOfWork.getEntityManager();

    const authorRepository = this.authorRepositoryFactory.create(entityManager);

    const authors = await authorRepository.findAuthors({ filters, pagination });

    return Validator.validate(findAuthorsQueryHandlerResultSchema, { authors });
  }
}
