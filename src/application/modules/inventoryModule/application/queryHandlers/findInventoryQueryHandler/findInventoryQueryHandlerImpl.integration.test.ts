import 'reflect-metadata';

import { DataSource } from 'typeorm';

import { FindInventoryQueryHandler } from './findInventoryQueryHandler';
import { TestTransactionInternalRunner } from '../../../../../../common/tests/testTransactionInternalRunner';
import { postgresModuleSymbols } from '../../../../../../libs/postgres/postgresModuleSymbols';
import { Application } from '../../../../../application';
import { BookRepositoryFactory } from '../../../../bookModule/application/repositories/bookRepository/bookRepositoryFactory';
import { bookSymbols } from '../../../../bookModule/symbols';
import { BookEntityTestFactory } from '../../../../bookModule/tests/factories/bookEntityTestFactory/bookEntityTestFactory';
import { symbols } from '../../../symbols';
import { InventoryEntityTestFactory } from '../../../tests/factories/inventoryEntityTestFactory/inventoryEntityTestFactory';
import { InventoryNotFoundError } from '../../errors/inventoryNotFoundError';
import { InventoryRepositoryFactory } from '../../repositories/inventoryRepository/inventoryRepositoryFactory';

describe('FindInventoryQueryHandler', () => {
  let findInventoryQueryHandler: FindInventoryQueryHandler;
  let inventoryRepositoryFactory: InventoryRepositoryFactory;
  let bookRepositoryFactory: BookRepositoryFactory;
  let testTransactionRunner: TestTransactionInternalRunner;
  let dataSource: DataSource;

  const inventoryEntityTestFactory = new InventoryEntityTestFactory();
  const bookEntityTestFactory = new BookEntityTestFactory();

  beforeAll(async () => {
    const container = Application.createContainer();

    findInventoryQueryHandler = container.get<FindInventoryQueryHandler>(symbols.findInventoryQueryHandler);
    inventoryRepositoryFactory = container.get<InventoryRepositoryFactory>(symbols.inventoryRepositoryFactory);
    bookRepositoryFactory = container.get<BookRepositoryFactory>(bookSymbols.bookRepositoryFactory);
    dataSource = container.get<DataSource>(postgresModuleSymbols.dataSource);

    await dataSource.initialize();

    testTransactionRunner = new TestTransactionInternalRunner(container);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it('finds inventory by id in database', async () => {
    expect.assertions(1);

    await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
      const entityManager = unitOfWork.getEntityManager();

      const inventoryRepository = inventoryRepositoryFactory.create(entityManager);

      const bookRepository = bookRepositoryFactory.create(entityManager);

      const { id, title, isbn, releaseYear, language, format, price } = bookEntityTestFactory.create();

      const { id: inventoryId, quantity } = inventoryEntityTestFactory.create();

      const book = await bookRepository.createBook({
        id,
        title,
        isbn,
        releaseYear,
        language,
        format,
        price,
      });

      const inventory = await inventoryRepository.createInventory({ id: inventoryId, bookId: book.id, quantity });

      const { inventory: foundInventory } = await findInventoryQueryHandler.execute({
        unitOfWork,
        inventoryId: inventory.id,
      });

      expect(foundInventory).not.toBeNull();
    });
  });

  it('should throw if inventory with given id does not exist in db', async () => {
    expect.assertions(1);

    await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
      const { id } = inventoryEntityTestFactory.create();

      try {
        await findInventoryQueryHandler.execute({ unitOfWork, inventoryId: id });
      } catch (error) {
        expect(error).toBeInstanceOf(InventoryNotFoundError);
      }
    });
  });
});
