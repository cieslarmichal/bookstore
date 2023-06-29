import { FindWhishlistEntryQueryHandler } from './findWhishlistEntryQueryHandler';
import {
  FindWhishlistEntryQueryHandlerPayload,
  findWhishlistEntryQueryHandlerPayloadSchema,
} from './payloads/findWhishlistEntryQueryHandlerPayload';
import {
  FindWhishlistEntryQueryHandlerResult,
  findWhishlistEntryQueryHandlerResultSchema,
} from './payloads/findWhishlistEntryQueryHandlerResult';
import { Injectable, Inject } from '../../../../../../libs/dependencyInjection/decorators';
import { Validator } from '../../../../../../libs/validator/validator';
import { whishlistSymbols } from '../../../symbols';
import { WhishlistEntryNotFoundError } from '../../errors/whishlistEntryNotFoundError';
import { WhishlistEntryRepositoryFactory } from '../../repositories/whishlistEntryRepository/whishlistEntryRepositoryFactory';

@Injectable()
export class FindWhishlistEntryQueryHandlerImpl implements FindWhishlistEntryQueryHandler {
  public constructor(
    @Inject(whishlistSymbols.whishlistEntryRepositoryFactory)
    private readonly whishlistEntryRepositoryFactory: WhishlistEntryRepositoryFactory,
  ) {}

  public async execute(input: FindWhishlistEntryQueryHandlerPayload): Promise<FindWhishlistEntryQueryHandlerResult> {
    const { unitOfWork, whishlistEntryId } = Validator.validate(findWhishlistEntryQueryHandlerPayloadSchema, input);

    const entityManager = unitOfWork.getEntityManager();

    const whishlistEntryRepository = this.whishlistEntryRepositoryFactory.create(entityManager);

    const whishlistEntry = await whishlistEntryRepository.findWhishlistEntry({ id: whishlistEntryId });

    if (!whishlistEntry) {
      throw new WhishlistEntryNotFoundError({ id: whishlistEntryId });
    }

    return Validator.validate(findWhishlistEntryQueryHandlerResultSchema, { whishlistEntry });
  }
}
