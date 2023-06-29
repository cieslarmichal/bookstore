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
import { inventorySymbols } from '../../../symbols';
import { InventoryNotFoundError } from '../../errors/inventoryNotFoundError';
import { InventoryRepositoryFactory } from '../../repositories/inventoryRepository/inventoryRepositoryFactory';
import { FindInventoryPayload } from '../../repositories/inventoryRepository/payloads/findInventoryPayload';

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

    let findInventoryInput: FindInventoryPayload = {};

    if (inventoryId) {
      findInventoryInput = { ...findInventoryInput, id: inventoryId };
    }

    if (bookId) {
      findInventoryInput = { ...findInventoryInput, bookId };
    }

    const inventory = await inventoryRepository.findInventory(findInventoryInput);

    if (!inventory) {
      throw new InventoryNotFoundError({ bookId: findInventoryInput.bookId, inventoryId: findInventoryInput.id });
    }

    return Validator.validate(findInventoryQueryHandlerResultSchema, { inventory });
  }
}
