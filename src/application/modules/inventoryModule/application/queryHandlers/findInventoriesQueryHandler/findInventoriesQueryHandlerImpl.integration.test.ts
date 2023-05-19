import 'reflect-metadata';

import { DataSource } from 'typeorm';

import { FindInventoriesQueryHandler } from './findInventoriesQueryHandler';
import { TestTransactionInternalRunner } from '../../../../../../common/tests/testTransactionInternalRunner';
import { postgresModuleSymbols } from '../../../../../../libs/postgres/postgresModuleSymbols';
import { Application } from '../../../../../application';
import { BookRepositoryFactory } from '../../../../bookModule/application/repositories/bookRepository/bookRepositoryFactory';
import { bookSymbols } from '../../../../bookModule/symbols';
import { BookEntityTestFactory } from '../../../../bookModule/tests/factories/bookEntityTestFactory/bookEntityTestFactory';
import { symbols } from '../../../symbols';
import { InventoryEntityTestFactory } from '../../../tests/factories/inventoryEntityTestFactory/inventoryEntityTestFactory';
import { InventoryRepositoryFactory } from '../../repositories/inventoryRepository/inventoryRepositoryFactory';

describe('FindInventoriesQueryHandler', () => {
  let findInventoriesQueryHandler: FindInventoriesQueryHandler;
  let inventoryRepositoryFactory: InventoryRepositoryFactory;
  let bookRepositoryFactory: BookRepositoryFactory;
  let testTransactionRunner: TestTransactionInternalRunner;
  let dataSource: DataSource;

  const inventoryEntityTestFactory = new InventoryEntityTestFactory();
  const bookEntityTestFactory = new BookEntityTestFactory();

  beforeAll(async () => {
    const container = Application.createContainer();

    findInventoriesQueryHandler = container.get<FindInventoriesQueryHandler>(symbols.findInventoriesQueryHandler);
    inventoryRepositoryFactory = container.get<InventoryRepositoryFactory>(symbols.inventoryRepositoryFactory);
    bookRepositoryFactory = container.get<BookRepositoryFactory>(bookSymbols.bookRepositoryFactory);
    dataSource = container.get<DataSource>(postgresModuleSymbols.dataSource);

    await dataSource.initialize();

    testTransactionRunner = new TestTransactionInternalRunner(container);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it('finds inventories', async () => {
    expect.assertions(2);

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

      const { inventories } = await findInventoriesQueryHandler.execute({
        unitOfWork,
        pagination: {
          page: 1,
          limit: 5,
        },
      });

      expect(inventories.length).toBe(1);
      expect(inventories[0]).toStrictEqual(inventory);
    });
  });
});
