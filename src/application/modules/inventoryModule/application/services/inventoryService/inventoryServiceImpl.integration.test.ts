import 'reflect-metadata';

import { DataSource } from 'typeorm';

import { InventoryService } from './inventoryService';
import { TestTransactionInternalRunner } from '../../../../../../common/tests/testTransactionInternalRunner';
import { DependencyInjectionContainerFactory } from '../../../../../../libs/dependencyInjection/dependencyInjectionContainerFactory';
import { LoggerModule } from '../../../../../../libs/logger/loggerModule';
import { LoggerModuleConfigTestFactory } from '../../../../../../libs/logger/tests/factories/loggerModuleConfigTestFactory/loggerModuleConfigTestFactory';
import { PostgresModule } from '../../../../../../libs/postgres/postgresModule';
import { postgresModuleSymbols } from '../../../../../../libs/postgres/postgresModuleSymbols';
import { PostgresModuleConfigTestFactory } from '../../../../../../libs/postgres/tests/factories/postgresModuleConfigTestFactory/postgresModuleConfigTestFactory';
import { UnitOfWorkModule } from '../../../../../../libs/unitOfWork/unitOfWorkModule';
import { AddressEntity } from '../../../../addressModule/infrastructure/repositories/addressRepository/addressEntity/addressEntity';
import { AuthorBookEntity } from '../../../../authorBookModule/infrastructure/repositories/authorBookRepository/authorBookEntity/authorBookEntity';
import { AuthorEntity } from '../../../../authorModule/infrastructure/repositories/authorRepository/authorEntity/authorEntity';
import { BookCategoryEntity } from '../../../../bookCategoryModule/infrastructure/repositories/bookCategoryRepository/bookCategoryEntity/bookCategoryEntity';
import { BookRepositoryFactory } from '../../../../bookModule/application/repositories/bookRepository/bookRepositoryFactory';
import { BookModule } from '../../../../bookModule/bookModule';
import { BookEntity } from '../../../../bookModule/infrastructure/repositories/bookRepository/bookEntity/bookEntity';
import { bookSymbols } from '../../../../bookModule/symbols';
import { BookEntityTestFactory } from '../../../../bookModule/tests/factories/bookEntityTestFactory/bookEntityTestFactory';
import { CategoryEntity } from '../../../../categoryModule/infrastructure/repositories/categoryRepository/categoryEntity/categoryEntity';
import { CustomerEntity } from '../../../../customerModule/infrastructure/repositories/customerRepository/customerEntity/customerEntity';
import { CartEntity } from '../../../../orderModule/infrastructure/repositories/cartRepository/cartEntity/cartEntity';
import { LineItemEntity } from '../../../../orderModule/infrastructure/repositories/lineItemRepository/lineItemEntity/lineItemEntity';
import { OrderEntity } from '../../../../orderModule/infrastructure/repositories/orderRepository/orderEntity/orderEntity';
import { ReviewEntity } from '../../../../reviewModule/infrastructure/repositories/reviewRepository/reviewEntity/reviewEntity';
import { UserEntity } from '../../../../userModule/infrastructure/repositories/userRepository/userEntity/userEntity';
import { InventoryAlreadyExistsError } from '../../../infrastructure/errors/inventoryAlreadyExistsError';
import { InventoryNotFoundError } from '../../../infrastructure/errors/inventoryNotFoundError';
import { InventoryEntity } from '../../../infrastructure/repositories/inventoryRepository/inventoryEntity/inventoryEntity';
import { InventoryModule } from '../../../inventoryModule';
import { inventoryModuleSymbols } from '../../../inventoryModuleSymbols';
import { InventoryEntityTestFactory } from '../../../tests/factories/inventoryEntityTestFactory/inventoryEntityTestFactory';
import { InventoryRepositoryFactory } from '../../repositories/inventoryRepository/inventoryRepositoryFactory';

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
    const container = DependencyInjectionContainerFactory.create({
      modules: [
        new PostgresModule(postgresModuleConfig),
        new InventoryModule(),
        new BookModule(),
        new LoggerModule(loggerModuleConfig),
        new UnitOfWorkModule(),
      ],
    });

    inventoryService = container.get<InventoryService>(inventoryModuleSymbols.inventoryService);
    inventoryRepositoryFactory = container.get<InventoryRepositoryFactory>(
      inventoryModuleSymbols.inventoryRepositoryFactory,
    );
    bookRepositoryFactory = container.get<BookRepositoryFactory>(bookSymbols.bookRepositoryFactory);
    dataSource = container.get<DataSource>(postgresModuleSymbols.dataSource);

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

        const book = await bookRepository.createBook({
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

        const book = await bookRepository.createBook({
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

        const book = await bookRepository.createBook({
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

        const book = await bookRepository.createBook({
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

        const book = await bookRepository.createBook({
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

        const book = await bookRepository.createBook({
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
