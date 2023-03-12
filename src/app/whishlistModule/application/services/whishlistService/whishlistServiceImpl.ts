import { CreateWhishlistEntryPayload, createWhishlistEntryPayloadSchema } from './payloads/createWhishlistEntryPayload';
import { DeleteWhishlistEntryPayload, deleteWhishlistEntryPayloadSchema } from './payloads/deleteWhishlistEntryPayload';
import { FindWhishlistEntriesPayload, findWhishlistEntriesPayloadSchema } from './payloads/findWhishlistEntriesPayload';
import { FindWhishlistEntryPayload, findWhishlistEntryPayloadSchema } from './payloads/findWhishlistEntryPayload';
import { WhishlistService } from './whishlistService';
import { Injectable, Inject } from '../../../../../libs/dependencyInjection/decorators';
import { LoggerService } from '../../../../../libs/logger/contracts/services/loggerService/loggerService';
import { loggerModuleSymbols } from '../../../../../libs/logger/loggerModuleSymbols';
import { UuidGenerator } from '../../../../../libs/uuid/uuidGenerator';
import { Validator } from '../../../../../libs/validator/implementations/validator';
import { WhishlistEntry } from '../../../domain/entities/whishlistEntry/whishlistEntry';
import { WhishlistEntryAlreadyExistsError } from '../../../infrastructure/errors/whishlistEntryAlreadyExistsError';
import { WhishlistEntryNotFoundError } from '../../../infrastructure/errors/whishlistEntryNotFoundError';
import { whishlistModuleSymbols } from '../../../whishlistModuleSymbols';
import { WhishlistEntryRepositoryFactory } from '../../repositories/whishlistEntryRepository/whishlistEntryRepositoryFactory';

@Injectable()
export class WhishlistServiceImpl implements WhishlistService {
  public constructor(
    @Inject(whishlistModuleSymbols.whishlistEntryRepositoryFactory)
    private readonly whishlistEntryRepositoryFactory: WhishlistEntryRepositoryFactory,
    @Inject(loggerModuleSymbols.loggerService)
    private readonly loggerService: LoggerService,
  ) {}

  public async createWhishlistEntry(input: CreateWhishlistEntryPayload): Promise<WhishlistEntry> {
    const {
      unitOfWork,
      draft: { bookId, customerId },
    } = Validator.validate(createWhishlistEntryPayloadSchema, input);

    this.loggerService.debug({ message: 'Creating whishlist entry...', context: { bookId, customerId } });

    const entityManager = unitOfWork.getEntityManager();

    const whishlistEntryRepository = this.whishlistEntryRepositoryFactory.create(entityManager);

    const existingWhishlistEntry = await whishlistEntryRepository.findOne({ bookId, customerId });

    if (existingWhishlistEntry) {
      throw new WhishlistEntryAlreadyExistsError({ bookId, customerId });
    }

    const whishlistEntry = await whishlistEntryRepository.createOne({
      id: UuidGenerator.generateUuid(),
      bookId,
      customerId,
    });

    this.loggerService.info({ message: 'Whishlist entry created.', context: { whishlistEntryId: whishlistEntry.id } });

    return whishlistEntry;
  }

  public async findWhishlistEntry(input: FindWhishlistEntryPayload): Promise<WhishlistEntry> {
    const { unitOfWork, whishlistEntryId } = Validator.validate(findWhishlistEntryPayloadSchema, input);

    const entityManager = unitOfWork.getEntityManager();

    const whishlistEntryRepository = this.whishlistEntryRepositoryFactory.create(entityManager);

    const whishlistEntry = await whishlistEntryRepository.findOne({ id: whishlistEntryId });

    if (!whishlistEntry) {
      throw new WhishlistEntryNotFoundError({ id: whishlistEntryId });
    }

    return whishlistEntry;
  }

  public async findWhishlistEntries(input: FindWhishlistEntriesPayload): Promise<WhishlistEntry[]> {
    const { unitOfWork, pagination, customerId } = Validator.validate(findWhishlistEntriesPayloadSchema, input);

    const entityManager = unitOfWork.getEntityManager();

    const whishlistEntryRepository = this.whishlistEntryRepositoryFactory.create(entityManager);

    const whishlistEntrys = await whishlistEntryRepository.findMany({ customerId, pagination });

    return whishlistEntrys;
  }

  public async deleteWhishlistEntry(input: DeleteWhishlistEntryPayload): Promise<void> {
    const { unitOfWork, whishlistEntryId } = Validator.validate(deleteWhishlistEntryPayloadSchema, input);

    this.loggerService.debug({ message: 'Deleting whishlist entry...', context: { whishlistEntryId } });

    const entityManager = unitOfWork.getEntityManager();

    const whishlistEntryRepository = this.whishlistEntryRepositoryFactory.create(entityManager);

    await whishlistEntryRepository.deleteOne({ id: whishlistEntryId });

    this.loggerService.info({ message: 'Whishlist entry deleted.', context: { whishlistEntryId } });
  }
}
