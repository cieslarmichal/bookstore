import {
  UpdateAuthorCommandHandlerPayload,
  updateAuthorCommandHandlerPayloadSchema,
} from './payloads/updateAuthorCommandHandlerPayload';
import {
  UpdateAuthorCommandHandlerResult,
  updateAuthorCommandHandlerResultSchema,
} from './payloads/updateAuthorCommandHandlerResult';
import { UpdateAuthorCommandHandler } from './updateAuthorCommandHandler';
import { Injectable, Inject } from '../../../../../../libs/dependencyInjection/decorators';
import { loggerModuleSymbols } from '../../../../../../libs/logger/loggerModuleSymbols';
import { LoggerService } from '../../../../../../libs/logger/services/loggerService/loggerService';
import { Validator } from '../../../../../../libs/validator/validator';
import { authorSymbols } from '../../../symbols';
import { AuthorRepositoryFactory } from '../../repositories/authorRepository/authorRepositoryFactory';

@Injectable()
export class UpdateAuthorCommandHandlerImpl implements UpdateAuthorCommandHandler {
  public constructor(
    @Inject(authorSymbols.authorRepositoryFactory)
    private readonly authorRepositoryFactory: AuthorRepositoryFactory,
    @Inject(loggerModuleSymbols.loggerService)
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(input: UpdateAuthorCommandHandlerPayload): Promise<UpdateAuthorCommandHandlerResult> {
    const { unitOfWork, authorId, draft } = Validator.validate(updateAuthorCommandHandlerPayloadSchema, input);

    this.loggerService.debug({ message: 'Updating author...', context: { authorId, ...draft } });

    const entityManager = unitOfWork.getEntityManager();

    const authorRepository = this.authorRepositoryFactory.create(entityManager);

    const author = await authorRepository.updateAuthor({ id: authorId, draft });

    this.loggerService.info({ message: 'Author updated.', context: { authorId } });

    return Validator.validate(updateAuthorCommandHandlerResultSchema, { author });
  }
}
