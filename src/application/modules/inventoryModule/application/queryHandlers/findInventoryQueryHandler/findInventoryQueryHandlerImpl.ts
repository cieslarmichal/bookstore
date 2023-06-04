import { FindInventoryQueryHandler } from './findInventoryQueryHandler';
import {
  FindInventoryQueryHandlerPayload,
  findInventoryQueryHandlerPayloadSchema,
} from './payloads/findInventoryQueryHandlerPayload';
import {
  FindInventoryQueryHandlerResult,
  findInventoryQueryHandlerResultSchema,
} from './payloads/findInventoryQueryHandlerResult';
import { Injectable, Inject } from '../../../../../../libs/dependencyInjection/decorators';
import { Validator } from '../../../../../../libs/validator/validator';
import { InventoryNotFoundError } from '../../errors/inventoryNotFoundError';
import { inventorySymbols } from '../../../symbols';
import { InventoryRepositoryFactory } from '../../repositories/inventoryRepository/inventoryRepositoryFactory';

@Injectable()
export class FindInventoryQueryHandlerImpl implements FindInventoryQueryHandler {
  public constructor(
    @Inject(inventorySymbols.inventoryRepositoryFactory)
    private readonly inventoryRepositoryFactory: InventoryRepositoryFactory,
  ) {}

  public async execute(input: FindInventoryQueryHandlerPayload): Promise<FindInventoryQueryHandlerResult> {
    const { unitOfWork, inventoryId, bookId } = Validator.validate(findInventoryQueryHandlerPayloadSchema, input);

    const entityManager = unitOfWork.getEntityManager();

    const inventoryRepository = this.inventoryRepositoryFactory.create(entityManager);

    let findInventoryInput = {};

    if (inventoryId) {
      findInventoryInput = { ...findInventoryInput, inventoryId };
    }

    if (bookId) {
      findInventoryInput = { ...findInventoryInput, bookId };
    }

    const inventory = await inventoryRepository.findInventory(findInventoryInput);

    if (!inventory) {
      throw new InventoryNotFoundError(findInventoryInput);
    }

    return Validator.validate(findInventoryQueryHandlerResultSchema, { inventory });
  }
}
