import 'reflect-metadata';

import { DataSource } from 'typeorm';

import { DependencyInjectionContainerFactory } from '../../../../../../libs/dependencyInjection/implementations/factories/dependencyInjectionContainerFactory/dependencyInjectionContainerFactory';
import { LoggerModule } from '../../../../../../libs/logger/loggerModule';
import { LoggerModuleConfigTestFactory } from '../../../../../../libs/logger/tests/factories/loggerModuleConfigTestFactory/loggerModuleConfigTestFactory';
import { PostgresModule } from '../../../../../../libs/postgres/postgresModule';
import { postgresSymbols } from '../../../../../../libs/postgres/postgresSymbols';
import { PostgresModuleConfigTestFactory } from '../../../../../../libs/postgres/tests/factories/postgresModuleConfigTestFactory/postgresModuleConfigTestFactory';
import { UnitOfWorkModule } from '../../../../../../libs/unitOfWork/unitOfWorkModule';
import { TestTransactionInternalRunner } from '../../../../../integrations/common/tests/unitOfWork/testTransactionInternalRunner';
import { AddressEntity } from '../../../../address/contracts/addressEntity';
import { AuthorEntity } from '../../../../author/contracts/authorEntity';
import { AuthorBookEntity } from '../../../../authorBook/contracts/authorBookEntity';
import { BookModule } from '../../../../book/bookModule';
import { bookSymbols } from '../../../../book/bookSymbols';
import { BookEntity } from '../../../../book/contracts/bookEntity';
import { BookRepositoryFactory } from '../../../../book/contracts/factories/bookRepositoryFactory/bookRepositoryFactory';
import { BookEntityTestFactory } from '../../../../book/tests/factories/bookEntityTestFactory/bookEntityTestFactory';
import { BookCategoryEntity } from '../../../../bookCategory/contracts/bookCategoryEntity';
import { CartEntity } from '../../../../cart/contracts/cartEntity';
import { CategoryEntity } from '../../../../category/contracts/categoryEntity';
import { CustomerEntity } from '../../../../customer/contracts/customerEntity';
import { LineItemEntity } from '../../../../lineItemModule/infrastructure/repositories/lineItemRepository/lineItemEntity/lineItemEntity';
import { OrderEntity } from '../../../../orderModule/infrastructure/repositories/orderRepository/orderEntity/orderEntity';
import { ReviewEntity } from '../../../../reviewModule/infrastructure/repositories/reviewRepository/reviewEntity/reviewEntity';
import { UserEntity } from '../../../../userModule/infrastructure/repositories/userRepository/userEntity/userEntity';
import { InventoryRepositoryFactory } from '../../../contracts/factories/inventoryRepositoryFactory/inventoryRepositoryFactory';
import { InventoryEntity } from '../../../contracts/inventoryEntity';
import { InventoryService } from '../../../contracts/services/inventoryService/inventoryService';
import { InventoryAlreadyExistsError } from '../../../errors/inventoryAlreadyExistsError';
import { InventoryNotFoundError } from '../../../errors/inventoryNotFoundError';
import { InventoryModule } from '../../../inventoryModule';
import { inventorySymbols } from '../../../inventorySymbols';
import { InventoryEntityTestFactory } from '../../../tests/factories/inventoryEntityTestFactory/inventoryEntityTestFactory';

describe('InventoryServiceImpl', () => {
  let inventoryService: InventoryService;
  let inventoryRepositoryFactory: InventoryRepositoryFactory;
  let bookRepositoryFactory: BookRepositoryFactory;
  let testTransactionRunner: TestTransactionInternalRunner;
  let dataSource: DataSource;

  const inventoryEntityTestFactory = new InventoryEntityTestFactory();
  const bookEntityTestFactory = new BookEntityTestFactory();

  const loggerModuleConfig = new LoggerModuleConfigTestFactory().create();
  const postgresModuleConfig = new PostgresModuleConfigTestFactory().create({
    entities: [
      BookEntity,
      AuthorEntity,
      UserEntity,
      CategoryEntity,
      AuthorBookEntity,
      BookCategoryEntity,
      AddressEntity,
      CustomerEntity,
      CartEntity,
      LineItemEntity,
      OrderEntity,
      InventoryEntity,
      ReviewEntity,
    ],
  });

  beforeAll(async () => {
    const container = await DependencyInjectionContainerFactory.create({
      modules: [
        new PostgresModule(postgresModuleConfig),
        new InventoryModule(),
        new BookModule(),
        new LoggerModule(loggerModuleConfig),
        new UnitOfWorkModule(),
      ],
    });

    inventoryService = container.get<InventoryService>(inventorySymbols.inventoryService);
    inventoryRepositoryFactory = container.get<InventoryRepositoryFactory>(inventorySymbols.inventoryRepositoryFactory);
    bookRepositoryFactory = container.get<BookRepositoryFactory>(bookSymbols.bookRepositoryFactory);
    dataSource = container.get<DataSource>(postgresSymbols.dataSource);

    await dataSource.initialize();

    testTransactionRunner = new TestTransactionInternalRunner(container);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  describe('Create inventory', () => {
    it('creates inventory in database', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const inventoryRepository = inventoryRepositoryFactory.create(entityManager);

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const { id, title, isbn, releaseYear, language, format, price } = bookEntityTestFactory.create();

        const { quantity } = inventoryEntityTestFactory.create();

        const book = await bookRepository.createOne({
          id,
          title,
          isbn,
          releaseYear,
          language,
          format,
          price,
        });

        const inventory = await inventoryService.createInventory({ unitOfWork, draft: { bookId: book.id, quantity } });

        const foundInventory = await inventoryRepository.findOne({ id: inventory.id });

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

        const book = await bookRepository.createOne({
          id,
          title,
          isbn,
          releaseYear,
          language,
          format,
          price,
        });

        await inventoryRepository.createOne({ id: inventoryId, bookId: book.id, quantity });

        try {
          await inventoryService.createInventory({ unitOfWork, draft: { bookId: book.id, quantity } });
        } catch (error) {
          expect(error).toBeInstanceOf(InventoryAlreadyExistsError);
        }
      });
    });
  });

  describe('Find inventory', () => {
    it('finds inventory by id in database', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const inventoryRepository = inventoryRepositoryFactory.create(entityManager);

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const { id, title, isbn, releaseYear, language, format, price } = bookEntityTestFactory.create();

        const { id: inventoryId, quantity } = inventoryEntityTestFactory.create();

        const book = await bookRepository.createOne({
          id,
          title,
          isbn,
          releaseYear,
          language,
          format,
          price,
        });

        const inventory = await inventoryRepository.createOne({ id: inventoryId, bookId: book.id, quantity });

        const foundInventory = await inventoryService.findInventory({ unitOfWork, inventoryId: inventory.id });

        expect(foundInventory).not.toBeNull();
      });
    });

    it('should throw if inventory with given id does not exist in db', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { id } = inventoryEntityTestFactory.create();

        try {
          await inventoryService.findInventory({ unitOfWork, inventoryId: id });
        } catch (error) {
          expect(error).toBeInstanceOf(InventoryNotFoundError);
        }
      });
    });
  });

  describe('Find inventories', () => {
    it('finds inventories', async () => {
      expect.assertions(2);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const inventoryRepository = inventoryRepositoryFactory.create(entityManager);

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const { id, title, isbn, releaseYear, language, format, price } = bookEntityTestFactory.create();

        const { id: inventoryId, quantity } = inventoryEntityTestFactory.create();

        const book = await bookRepository.createOne({
          id,
          title,
          isbn,
          releaseYear,
          language,
          format,
          price,
        });

        const inventory = await inventoryRepository.createOne({ id: inventoryId, bookId: book.id, quantity });

        const inventories = await inventoryService.findInventories({
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

  describe('Update inventory', () => {
    it('updates inventory in database', async () => {
      expect.assertions(2);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const inventoryRepository = inventoryRepositoryFactory.create(entityManager);

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const { id, title, isbn, releaseYear, language, format, price } = bookEntityTestFactory.create();

        const { id: inventoryId, quantity } = inventoryEntityTestFactory.create();

        const updatedQuantity = quantity + 1;

        const book = await bookRepository.createOne({
          id,
          title,
          isbn,
          releaseYear,
          language,
          format,
          price,
        });

        const inventory = await inventoryRepository.createOne({ id: inventoryId, bookId: book.id, quantity });

        const updatedInventory = await inventoryService.updateInventory({
          unitOfWork,
          inventoryId: inventory.id,
          draft: { quantity: updatedQuantity },
        });

        expect(updatedInventory).not.toBeNull();
        expect(updatedInventory.quantity).toBe(updatedQuantity);
      });
    });

    it('should not update book and throw if inventory with given id does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { id, quantity } = inventoryEntityTestFactory.create();

        try {
          await inventoryService.updateInventory({ unitOfWork, inventoryId: id, draft: { quantity } });
        } catch (error) {
          expect(error).toBeInstanceOf(InventoryNotFoundError);
        }
      });
    });
  });

  describe('Delete inventory', () => {
    it('deletes inventory from database', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const inventoryRepository = inventoryRepositoryFactory.create(entityManager);

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const { id, title, isbn, releaseYear, language, format, price } = bookEntityTestFactory.create();

        const { id: inventoryId, quantity } = inventoryEntityTestFactory.create();

        const book = await bookRepository.createOne({
          id,
          title,
          isbn,
          releaseYear,
          language,
          format,
          price,
        });

        const inventory = await inventoryRepository.createOne({ id: inventoryId, bookId: book.id, quantity });

        await inventoryService.deleteInventory({ unitOfWork, inventoryId: inventory.id });

        const foundInventory = await inventoryRepository.findOne({ id: inventory.id });

        expect(foundInventory).toBeNull();
      });
    });

    it('should throw if inventory with given id does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { id } = inventoryEntityTestFactory.create();

        try {
          await inventoryService.deleteInventory({ unitOfWork, inventoryId: id });
        } catch (error) {
          expect(error).toBeInstanceOf(InventoryNotFoundError);
        }
      });
    });
  });
});
