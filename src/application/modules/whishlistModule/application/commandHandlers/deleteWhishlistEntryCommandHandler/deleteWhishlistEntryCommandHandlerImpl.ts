import { DeleteWhishlistEntryCommandHandler } from './deleteWhishlistEntryCommandHandler';
import {
  DeleteWhishlistEntryCommandHandlerPayload,
  deleteWhishlistEntryCommandHandlerPayloadSchema,
} from './payloads/deleteWhishlistEntryCommandHandlerPayload';
import { Injectable, Inject } from '../../../../../../libs/dependencyInjection/decorators';
import { loggerModuleSymbols } from '../../../../../../libs/logger/loggerModuleSymbols';
import { LoggerService } from '../../../../../../libs/logger/services/loggerService/loggerService';
import { Validator } from '../../../../../../libs/validator/validator';
import { whishlistSymbols } from '../../../symbols';
import { WhishlistEntryRepositoryFactory } from '../../repositories/whishlistEntryRepository/whishlistEntryRepositoryFactory';

@Injectable()
export class DeleteWhishlistEntryCommandHandlerImpl implements DeleteWhishlistEntryCommandHandler {
  public constructor(
    @Inject(whishlistSymbols.whishlistEntryRepositoryFactory)
    private readonly whishlistEntryRepositoryFactory: WhishlistEntryRepositoryFactory,
    @Inject(loggerModuleSymbols.loggerService)
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(input: DeleteWhishlistEntryCommandHandlerPayload): Promise<void> {
    const { unitOfWork, whishlistEntryId } = Validator.validate(deleteWhishlistEntryCommandHandlerPayloadSchema, input);

    this.loggerService.debug({ message: 'Deleting whishlist entry...', context: { whishlistEntryId } });

    const entityManager = unitOfWork.getEntityManager();

    const whishlistEntryRepository = this.whishlistEntryRepositoryFactory.create(entityManager);

    await whishlistEntryRepository.deleteWhishlistEntry({ id: whishlistEntryId });

    this.loggerService.info({ message: 'Whishlist entry deleted.', context: { whishlistEntryId } });
  }
}
