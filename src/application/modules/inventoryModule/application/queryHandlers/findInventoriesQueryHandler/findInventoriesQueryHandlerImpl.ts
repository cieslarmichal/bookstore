import { FindInventoriesQueryHandler } from './findInventoriesQueryHandler';
import {
  FindInventoriesQueryHandlerPayload,
  findInventoriesQueryHandlerPayloadSchema,
} from './payloads/findInventoriesQueryHandlerPayload';
import {
  FindInventoriesQueryHandlerResult,
  findInventoriesQueryHandlerResultSchema,
} from './payloads/findInventoriesQueryHandlerResult';
import { Injectable, Inject } from '../../../../../../libs/dependencyInjection/decorators';
import { Validator } from '../../../../../../libs/validator/validator';
import { inventorySymbols } from '../../../symbols';
import { InventoryRepositoryFactory } from '../../repositories/inventoryRepository/inventoryRepositoryFactory';

@Injectable()
export class FindInventoriesQueryHandlerImpl implements FindInventoriesQueryHandler {
  public constructor(
    @Inject(inventorySymbols.inventoryRepositoryFactory)
    private readonly inventoryRepositoryFactory: InventoryRepositoryFactory,
  ) {}

  public async execute(input: FindInventoriesQueryHandlerPayload): Promise<FindInventoriesQueryHandlerResult> {
    const { unitOfWork, pagination, bookId } = Validator.validate(findInventoriesQueryHandlerPayloadSchema, input);

    const entityManager = unitOfWork.getEntityManager();

    const inventoryRepository = this.inventoryRepositoryFactory.create(entityManager);

    const inventories = await inventoryRepository.findInventories({ pagination, bookId });

    return Validator.validate(findInventoriesQueryHandlerResultSchema, { inventories });
  }
}
