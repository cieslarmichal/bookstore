import { FindWhishlistEntriesQueryHandler } from './findWhishlistEntriesQueryHandler';
import {
  FindWhishlistEntriesQueryHandlerPayload,
  findWhishlistEntriesQueryHandlerPayloadSchema,
} from './payloads/findWhishlistEntriesQueryHandlerPayload';
import {
  FindWhishlistEntriesQueryHandlerResult,
  findWhishlistEntriesQueryHandlerResultSchema,
} from './payloads/findWhishlistEntriesQueryHandlerResult';
import { Injectable, Inject } from '../../../../../../libs/dependencyInjection/decorators';
import { Validator } from '../../../../../../libs/validator/validator';
import { whishlistSymbols } from '../../../symbols';
import { WhishlistEntryRepositoryFactory } from '../../repositories/whishlistEntryRepository/whishlistEntryRepositoryFactory';

@Injectable()
export class FindWhishlistEntriesQueryHandlerImpl implements FindWhishlistEntriesQueryHandler {
  public constructor(
    @Inject(whishlistSymbols.whishlistEntryRepositoryFactory)
    private readonly whishlistEntryRepositoryFactory: WhishlistEntryRepositoryFactory,
  ) {}

  public async execute(
    input: FindWhishlistEntriesQueryHandlerPayload,
  ): Promise<FindWhishlistEntriesQueryHandlerResult> {
    const { unitOfWork, pagination, customerId } = Validator.validate(
      findWhishlistEntriesQueryHandlerPayloadSchema,
      input,
    );

    const entityManager = unitOfWork.getEntityManager();

    const whishlistEntryRepository = this.whishlistEntryRepositoryFactory.create(entityManager);

    const whishlistEntries = await whishlistEntryRepository.findWhishlistEntries({ customerId, pagination });

    return Validator.validate(findWhishlistEntriesQueryHandlerResultSchema, { whishlistEntries });
  }
}
