import 'reflect-metadata';

import { DataSource } from 'typeorm';

import { CreateInventoryCommandHandler } from './createInventoryCommandHandler';
import { TestTransactionInternalRunner } from '../../../../../../common/tests/testTransactionInternalRunner';
import { postgresModuleSymbols } from '../../../../../../libs/postgres/postgresModuleSymbols';
import { Application } from '../../../../../application';
import { BookRepositoryFactory } from '../../../../bookModule/application/repositories/bookRepository/bookRepositoryFactory';
import { bookSymbols } from '../../../../bookModule/symbols';
import { BookEntityTestFactory } from '../../../../bookModule/tests/factories/bookEntityTestFactory/bookEntityTestFactory';
import { symbols } from '../../../symbols';
import { InventoryEntityTestFactory } from '../../../tests/factories/inventoryEntityTestFactory/inventoryEntityTestFactory';
import { InventoryAlreadyExistsError } from '../../errors/inventoryAlreadyExistsError';
import { InventoryRepositoryFactory } from '../../repositories/inventoryRepository/inventoryRepositoryFactory';

describe('CreateInventoryCommandHandler', () => {
  let createInventoryCommandHandler: CreateInventoryCommandHandler;
  let inventoryRepositoryFactory: InventoryRepositoryFactory;
  let bookRepositoryFactory: BookRepositoryFactory;
  let testTransactionRunner: TestTransactionInternalRunner;
  let dataSource: DataSource;

  const inventoryEntityTestFactory = new InventoryEntityTestFactory();
  const bookEntityTestFactory = new BookEntityTestFactory();

  beforeAll(async () => {
    const container = Application.createContainer();

    createInventoryCommandHandler = container.get<CreateInventoryCommandHandler>(symbols.createInventoryCommandHandler);
    inventoryRepositoryFactory = container.get<InventoryRepositoryFactory>(symbols.inventoryRepositoryFactory);
    bookRepositoryFactory = container.get<BookRepositoryFactory>(bookSymbols.bookRepositoryFactory);
    dataSource = container.get<DataSource>(postgresModuleSymbols.dataSource);

    await dataSource.initialize();

    testTransactionRunner = new TestTransactionInternalRunner(container);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it('creates inventory in database', async () => {
    expect.assertions(1);

    await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
      const entityManager = unitOfWork.getEntityManager();

      const inventoryRepository = inventoryRepositoryFactory.create(entityManager);

      const bookRepository = bookRepositoryFactory.create(entityManager);

      const { id, title, isbn, releaseYear, language, format, price } = bookEntityTestFactory.create();

      const { quantity } = inventoryEntityTestFactory.create();

      const book = await bookRepository.createBook({
        id,
        title,
        isbn,
        releaseYear,
        language,
        format,
        price,
      });

      const { inventory } = await createInventoryCommandHandler.execute({
        unitOfWork,
        draft: { bookId: book.id, quantity },
      });

      const foundInventory = await inventoryRepository.findInventory({ id: inventory.id });

      expect(foundInventory).not.toBeNull();
    });
  });

  it('throws if inventory with bookId already exists in database', async () => {
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

      await inventoryRepository.createInventory({ id: inventoryId, bookId: book.id, quantity });

      try {
        await createInventoryCommandHandler.execute({ unitOfWork, draft: { bookId: book.id, quantity } });
      } catch (error) {
        expect(error).toBeInstanceOf(InventoryAlreadyExistsError);
      }
    });
  });
});
