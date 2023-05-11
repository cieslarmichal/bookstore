import { DeleteAuthorCommandHandler } from './deleteAuthorCommandHandler';
import {
  DeleteAuthorCommandHandlerPayload,
  deleteAuthorCommandHandlerPayloadSchema,
} from './payloads/deleteAuthorCommandHandlerPayload';
import { Injectable, Inject } from '../../../../../../libs/dependencyInjection/decorators';
import { loggerModuleSymbols } from '../../../../../../libs/logger/loggerModuleSymbols';
import { LoggerService } from '../../../../../../libs/logger/services/loggerService/loggerService';
import { Validator } from '../../../../../../libs/validator/validator';
import { authorSymbols } from '../../../symbols';
import { AuthorRepositoryFactory } from '../../repositories/authorRepository/authorRepositoryFactory';

@Injectable()
export class DeleteAuthorCommandHandlerImpl implements DeleteAuthorCommandHandler {
  public constructor(
    @Inject(authorSymbols.authorRepositoryFactory)
    private readonly authorRepositoryFactory: AuthorRepositoryFactory,
    @Inject(loggerModuleSymbols.loggerService)
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(input: DeleteAuthorCommandHandlerPayload): Promise<void> {
    const { unitOfWork, authorId } = Validator.validate(deleteAuthorCommandHandlerPayloadSchema, input);

    this.loggerService.debug({ message: 'Deleting author...', context: { authorId } });

    const entityManager = unitOfWork.getEntityManager();

    const authorRepository = this.authorRepositoryFactory.create(entityManager);

    await authorRepository.deleteAuthor({ id: authorId });

    this.loggerService.info({ message: 'Author deleted.', context: { authorId } });
  }
}
