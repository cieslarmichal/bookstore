import { CreateAuthorCommandHandler } from './createAuthorCommandHandler';
import {
  CreateAuthorCommandHandlerPayload,
  createAuthorCommandHandlerPayloadSchema,
} from './payloads/createAuthorCommandHandlerPayload';
import {
  CreateAuthorCommandHandlerResult,
  createAuthorCommandHandlerResultSchema,
} from './payloads/createAuthorCommandHandlerResult';
import { Injectable, Inject } from '../../../../../../libs/dependencyInjection/decorators';
import { loggerModuleSymbols } from '../../../../../../libs/logger/loggerModuleSymbols';
import { LoggerService } from '../../../../../../libs/logger/services/loggerService/loggerService';
import { UuidGenerator } from '../../../../../../libs/uuid/uuidGenerator';
import { Validator } from '../../../../../../libs/validator/validator';
import { authorSymbols } from '../../../symbols';
import { AuthorRepositoryFactory } from '../../repositories/authorRepository/authorRepositoryFactory';

@Injectable()
export class CreateAuthorCommandHandlerImpl implements CreateAuthorCommandHandler {
  public constructor(
    @Inject(authorSymbols.authorRepositoryFactory)
    private readonly authorRepositoryFactory: AuthorRepositoryFactory,
    @Inject(loggerModuleSymbols.loggerService)
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(input: CreateAuthorCommandHandlerPayload): Promise<CreateAuthorCommandHandlerResult> {
    const { unitOfWork, draft } = Validator.validate(createAuthorCommandHandlerPayloadSchema, input);

    this.loggerService.debug({ message: 'Creating author...', context: { ...draft } });

    const entityManager = unitOfWork.getEntityManager();

    const authorRepository = this.authorRepositoryFactory.create(entityManager);

    const author = await authorRepository.createAuthor({ id: UuidGenerator.generateUuid(), ...draft });

    this.loggerService.info({ message: 'Author created.', context: { authorId: author.id } });

    return Validator.validate(createAuthorCommandHandlerResultSchema, { author });
  }
}
