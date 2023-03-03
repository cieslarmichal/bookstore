import { Injectable, Inject } from '../../../../../libs/dependencyInjection/contracts/decorators';
import { LoggerService } from '../../../../../libs/logger/contracts/services/loggerService/loggerService';
import { loggerSymbols } from '../../../../../libs/logger/loggerSymbols';
import { UuidGenerator } from '../../../../../libs/uuid/implementations/uuidGenerator';
import { Validator } from '../../../../../libs/validator/implementations/validator';
import { WhishlistEntryRepositoryFactory } from '../../../contracts/factories/whishlistEntryRepositoryFactory/whishlistEntryRepositoryFactory';
import {
  CreateWhishlistEntryPayload,
  createWhishlistEntryPayloadSchema,
} from '../../../contracts/services/whishlistService/createWhishlistEntryPayload';
import {
  DeleteWhishlistEntryPayload,
  deleteWhishlistEntryPayloadSchema,
} from '../../../contracts/services/whishlistService/deleteWhishlistEntryPayload';
import {
  FindWhishlistEntriesPayload,
  findWhishlistEntriesPayloadSchema,
} from '../../../contracts/services/whishlistService/findWhishlistEntriesPayload';
import {
  FindWhishlistEntryPayload,
  findWhishlistEntryPayloadSchema,
} from '../../../contracts/services/whishlistService/findWhishlistEntryPayload';
import { WhishlistService } from '../../../contracts/services/whishlistService/whishlistService';
import { WhishlistEntry } from '../../../contracts/whishlistEntry';
import { WhishlistEntryAlreadyExistsError } from '../../../errors/whishlistEntryAlreadyExistsError';
import { WhishlistEntryNotFoundError } from '../../../errors/whishlistEntryNotFoundError';
import { whishlistSymbols } from '../../../whishlistSymbols';

@Injectable()
export class WhishlistServiceImpl implements WhishlistService {
  public constructor(
    @Inject(whishlistSymbols.whishlistEntryRepositoryFactory)
    private readonly whishlistEntryRepositoryFactory: WhishlistEntryRepositoryFactory,
    @Inject(loggerSymbols.loggerService)
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
