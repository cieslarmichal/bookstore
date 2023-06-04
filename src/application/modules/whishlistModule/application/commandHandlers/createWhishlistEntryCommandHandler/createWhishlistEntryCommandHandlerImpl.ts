import { CreateWhishlistEntryCommandHandler } from './createWhishlistEntryCommandHandler';
import {
  CreateWhishlistEntryCommandHandlerPayload,
  createWhishlistEntryCommandHandlerPayloadSchema,
} from './payloads/createWhishlistEntryCommandHandlerPayload';
import {
  CreateWhishlistEntryCommandHandlerResult,
  createWhishlistEntryCommandHandlerResultSchema,
} from './payloads/createWhishlistEntryCommandHandlerResult';
import { Injectable, Inject } from '../../../../../../libs/dependencyInjection/decorators';
import { loggerModuleSymbols } from '../../../../../../libs/logger/loggerModuleSymbols';
import { LoggerService } from '../../../../../../libs/logger/services/loggerService/loggerService';
import { UuidGenerator } from '../../../../../../libs/uuid/uuidGenerator';
import { Validator } from '../../../../../../libs/validator/validator';
import { WhishlistEntryAlreadyExistsError } from '../../errors/whishlistEntryAlreadyExistsError';
import { whishlistSymbols } from '../../../symbols';
import { WhishlistEntryRepositoryFactory } from '../../repositories/whishlistEntryRepository/whishlistEntryRepositoryFactory';

@Injectable()
export class CreateWhishlistEntryCommandHandlerImpl implements CreateWhishlistEntryCommandHandler {
  public constructor(
    @Inject(whishlistSymbols.whishlistEntryRepositoryFactory)
    private readonly whishlistEntryRepositoryFactory: WhishlistEntryRepositoryFactory,
    @Inject(loggerModuleSymbols.loggerService)
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(
    input: CreateWhishlistEntryCommandHandlerPayload,
  ): Promise<CreateWhishlistEntryCommandHandlerResult> {
    const {
      unitOfWork,
      draft: { bookId, customerId },
    } = Validator.validate(createWhishlistEntryCommandHandlerPayloadSchema, input);

    this.loggerService.debug({ message: 'Creating whishlist entry...', context: { bookId, customerId } });

    const entityManager = unitOfWork.getEntityManager();

    const whishlistEntryRepository = this.whishlistEntryRepositoryFactory.create(entityManager);

    const existingWhishlistEntry = await whishlistEntryRepository.findWhishlistEntry({ bookId, customerId });

    if (existingWhishlistEntry) {
      throw new WhishlistEntryAlreadyExistsError({ bookId, customerId });
    }

    const whishlistEntry = await whishlistEntryRepository.createWhishlistEntry({
      id: UuidGenerator.generateUuid(),
      bookId,
      customerId,
    });

    this.loggerService.info({ message: 'Whishlist entry created.', context: { whishlistEntryId: whishlistEntry.id } });

    return Validator.validate(createWhishlistEntryCommandHandlerResultSchema, { whishlistEntry });
  }
}
