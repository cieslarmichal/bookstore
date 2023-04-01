import 'reflect-metadata';

import { DataSource } from 'typeorm';

import { AuthorBookService } from './authorBookService';
import { TestTransactionInternalRunner } from '../../../../../common/tests/testTransactionInternalRunner';
import { DependencyInjectionContainerFactory } from '../../../../../libs/dependencyInjection/dependencyInjectionContainerFactory';
import { LoggerModule } from '../../../../../libs/logger/loggerModule';
import { LoggerModuleConfigTestFactory } from '../../../../../libs/logger/tests/factories/loggerModuleConfigTestFactory/loggerModuleConfigTestFactory';
import { PostgresModule } from '../../../../../libs/postgres/postgresModule';
import { postgresModuleSymbols } from '../../../../../libs/postgres/postgresModuleSymbols';
import { PostgresModuleConfigTestFactory } from '../../../../../libs/postgres/tests/factories/postgresModuleConfigTestFactory/postgresModuleConfigTestFactory';
import { UnitOfWorkModule } from '../../../../../libs/unitOfWork/unitOfWorkModule';
import { AddressEntity } from '../../../../addressModule/infrastructure/repositories/addressRepository/addressEntity/addressEntity';
import { AuthorRepositoryFactory } from '../../../../authorModule/application/repositories/authorRepository/authorRepositoryFactory';
import { AuthorModule } from '../../../../authorModule/authorModule';
import { authorModuleSymbols } from '../../../../authorModule/authorModuleSymbols';
import { AuthorEntity } from '../../../../authorModule/infrastructure/repositories/authorRepository/authorEntity/authorEntity';
import { AuthorEntityTestFactory } from '../../../../authorModule/tests/factories/authorEntityTestFactory/authorEntityTestFactory';
import { BookCategoryEntity } from '../../../../bookCategoryModule/infrastructure/repositories/bookCategoryRepository/bookCategoryEntity/bookCategoryEntity';
import { BookRepositoryFactory } from '../../../../bookModule/application/repositories/bookRepository/bookRepositoryFactory';
import { BookModule } from '../../../../bookModule/bookModule';
import { bookModuleSymbols } from '../../../../bookModule/bookModuleSymbols';
import { BookEntity } from '../../../../bookModule/infrastructure/repositories/bookRepository/bookEntity/bookEntity';
import { BookEntityTestFactory } from '../../../../bookModule/tests/factories/bookEntityTestFactory/bookEntityTestFactory';
import { CategoryModule } from '../../../../categoryModule/categoryModule';
import { CategoryEntity } from '../../../../categoryModule/infrastructure/repositories/categoryRepository/categoryEntity/categoryEntity';
import { CustomerEntity } from '../../../../customerModule/infrastructure/repositories/customerRepository/customerEntity/customerEntity';
import { InventoryEntity } from '../../../../inventoryModule/infrastructure/repositories/inventoryRepository/inventoryEntity/inventoryEntity';
import { CartEntity } from '../../../../orderModule/infrastructure/repositories/cartRepository/cartEntity/cartEntity';
import { LineItemEntity } from '../../../../orderModule/infrastructure/repositories/lineItemRepository/lineItemEntity/lineItemEntity';
import { OrderEntity } from '../../../../orderModule/infrastructure/repositories/orderRepository/orderEntity/orderEntity';
import { ReviewEntity } from '../../../../reviewModule/infrastructure/repositories/reviewRepository/reviewEntity/reviewEntity';
import { UserEntity } from '../../../../userModule/infrastructure/repositories/userRepository/userEntity/userEntity';
import { AuthorBookModule } from '../../../authorBookModule';
import { authorBookModuleSymbols } from '../../../authorBookModuleSymbols';
import { AuthorBookAlreadyExistsError } from '../../../infrastructure/errors/authorBookAlreadyExistsError';
import { AuthorBookNotFoundError } from '../../../infrastructure/errors/authorBookNotFoundError';
import { AuthorBookEntity } from '../../../infrastructure/repositories/authorBookRepository/authorBookEntity/authorBookEntity';
import { AuthorBookEntityTestFactory } from '../../../tests/factories/authorBookEntityTestFactory/authorBookEntityTestFactory';
import { AuthorBookRepositoryFactory } from '../../repositories/authorBookRepository/authorBookRepositoryFactory';

describe('AuthorBookServiceImpl', () => {
  let authorBookService: AuthorBookService;
  let authorBookRepositoryFactory: AuthorBookRepositoryFactory;
  let authorRepositoryFactory: AuthorRepositoryFactory;
  let bookRepositoryFactory: BookRepositoryFactory;
  let testTransactionRunner: TestTransactionInternalRunner;
  let dataSource: DataSource;

  const authorBookEntityTestFactory = new AuthorBookEntityTestFactory();
  const authorEntityTestFactory = new AuthorEntityTestFactory();
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
        new CategoryModule(),
        new BookModule(),
        new AuthorModule(),
        new AuthorBookModule(),
        new LoggerModule(loggerModuleConfig),
        new UnitOfWorkModule(),
      ],
    });

    authorBookService = container.get<AuthorBookService>(authorBookModuleSymbols.authorBookService);
    authorBookRepositoryFactory = container.get<AuthorBookRepositoryFactory>(
      authorBookModuleSymbols.authorBookRepositoryFactory,
    );
    authorRepositoryFactory = container.get<AuthorRepositoryFactory>(authorModuleSymbols.authorRepositoryFactory);
    bookRepositoryFactory = container.get<BookRepositoryFactory>(bookModuleSymbols.bookRepositoryFactory);
    dataSource = container.get<DataSource>(postgresModuleSymbols.dataSource);

    await dataSource.initialize();

    testTransactionRunner = new TestTransactionInternalRunner(container);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  describe('Create authorBook', () => {
    it('creates authorBook in database', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const authorRepository = authorRepositoryFactory.create(entityManager);

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const authorBookRepository = authorBookRepositoryFactory.create(entityManager);

        const authorEntity = authorEntityTestFactory.create();

        const bookEntity = bookEntityTestFactory.create();

        const author = await authorRepository.createOne({
          id: authorEntity.id,
          firstName: authorEntity.firstName,
          lastName: authorEntity.lastName,
        });

        const book = await bookRepository.createOne({
          id: bookEntity.id,
          format: bookEntity.format,
          language: bookEntity.language,
          price: bookEntity.price,
          title: bookEntity.title,
          isbn: bookEntity.isbn,
          releaseYear: bookEntity.releaseYear,
        });

        const authorBook = await authorBookService.createAuthorBook({
          unitOfWork,
          draft: {
            authorId: author.id,
            bookId: book.id,
          },
        });

        const foundAuthorBook = await authorBookRepository.findOne({ id: authorBook.id });

        expect(foundAuthorBook).not.toBeNull();
      });
    });

    it('should not create authorBook and throw if authorBook with the authorId and bookId exists', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const authorRepository = authorRepositoryFactory.create(entityManager);

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const authorEntity = authorEntityTestFactory.create();

        const bookEntity = bookEntityTestFactory.create();

        const author = await authorRepository.createOne({
          id: authorEntity.id,
          firstName: authorEntity.firstName,
          lastName: authorEntity.lastName,
        });

        const book = await bookRepository.createOne({
          id: bookEntity.id,
          format: bookEntity.format,
          language: bookEntity.language,
          price: bookEntity.price,
          title: bookEntity.title,
          isbn: bookEntity.isbn,
          releaseYear: bookEntity.releaseYear,
        });

        await authorBookService.createAuthorBook({
          unitOfWork,
          draft: {
            authorId: author.id,
            bookId: book.id,
          },
        });

        try {
          await authorBookService.createAuthorBook({
            unitOfWork,
            draft: {
              authorId: author.id,
              bookId: book.id,
            },
          });
        } catch (error) {
          expect(error).toBeInstanceOf(AuthorBookAlreadyExistsError);
        }
      });
    });
  });

  describe('Delete authorBook', () => {
    it('deletes authorBook from database', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const authorRepository = authorRepositoryFactory.create(entityManager);

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const authorBookRepository = authorBookRepositoryFactory.create(entityManager);

        const authorEntity = authorEntityTestFactory.create();

        const bookEntity = bookEntityTestFactory.create();

        const { id } = authorBookEntityTestFactory.create();

        const author = await authorRepository.createOne({
          id: authorEntity.id,
          firstName: authorEntity.firstName,
          lastName: authorEntity.lastName,
        });

        const book = await bookRepository.createOne({
          id: bookEntity.id,
          format: bookEntity.format,
          language: bookEntity.language,
          price: bookEntity.price,
          title: bookEntity.title,
          isbn: bookEntity.isbn,
          releaseYear: bookEntity.releaseYear,
        });

        const authorBook = await authorBookRepository.createOne({
          id,
          authorId: author.id,
          bookId: book.id,
        });

        await authorBookService.deleteAuthorBook({ unitOfWork, authorId: author.id, bookId: book.id });

        const foundAuthorBook = await authorBookRepository.findOne({ id: authorBook.id });

        expect(foundAuthorBook).toBeNull();
      });
    });

    it('should throw if authorBook with given id does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { authorId, bookId } = authorBookEntityTestFactory.create();

        try {
          await authorBookService.deleteAuthorBook({ unitOfWork, authorId, bookId });
        } catch (error) {
          expect(error).toBeInstanceOf(AuthorBookNotFoundError);
        }
      });
    });
  });
});
