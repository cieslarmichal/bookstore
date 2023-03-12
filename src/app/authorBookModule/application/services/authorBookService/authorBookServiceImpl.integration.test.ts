import 'reflect-metadata';

import { DataSource } from 'typeorm';

import { AuthorBookService } from './authorBookService';
import { TestTransactionInternalRunner } from '../../../../../common/tests/unitOfWork/testTransactionInternalRunner';
import { DependencyInjectionContainerFactory } from '../../../../../libs/dependencyInjection/implementations/factories/dependencyInjectionContainerFactory/dependencyInjectionContainerFactory';
import { LoggerModule } from '../../../../../libs/logger/loggerModule';
import { LoggerModuleConfigTestFactory } from '../../../../../libs/logger/tests/factories/loggerModuleConfigTestFactory/loggerModuleConfigTestFactory';
import { PostgresModule } from '../../../../../libs/postgres/postgresModule';
import { postgresSymbols } from '../../../../../libs/postgres/postgresSymbols';
import { PostgresModuleConfigTestFactory } from '../../../../../libs/postgres/tests/factories/postgresModuleConfigTestFactory/postgresModuleConfigTestFactory';
import { UnitOfWorkModule } from '../../../../../libs/unitOfWork/unitOfWorkModule';
import { AddressEntity } from '../../../../addressModule/infrastructure/repositories/addressRepository/addressEntity/addressEntity';
import { AuthorEntity } from '../../../../author/contracts/authorEntity';
import { AuthorRepositoryFactory } from '../../../../authorModule/application/repositories/authorRepository/authorRepositoryFactory';
import { AuthorModule } from '../../../../authorModule/authorModule';
import { authorModuleSymbols } from '../../../../authorModule/authorModuleSymbols';
import { AuthorEntityTestFactory } from '../../../../authorModule/tests/factories/authorEntityTestFactory/authorEntityTestFactory';
import { BookModule } from '../../../../domain/book/bookModule';
import { bookSymbols } from '../../../../domain/book/bookSymbols';
import { BookEntity } from '../../../../domain/book/contracts/bookEntity';
import { BookRepositoryFactory } from '../../../../domain/book/contracts/factories/bookRepositoryFactory/bookRepositoryFactory';
import { BookEntityTestFactory } from '../../../../domain/book/tests/factories/bookEntityTestFactory/bookEntityTestFactory';
import { BookCategoryEntity } from '../../../../domain/bookCategory/contracts/bookCategoryEntity';
import { CartEntity } from '../../../../domain/cart/contracts/cartEntity';
import { CategoryModule } from '../../../../domain/category/categoryModule';
import { CategoryEntity } from '../../../../domain/category/contracts/categoryEntity';
import { CustomerEntity } from '../../../../domain/customer/contracts/customerEntity';
import { InventoryEntity } from '../../../../domain/inventory/contracts/inventoryEntity';
import { LineItemEntity } from '../../../../domain/lineItem/contracts/lineItemEntity';
import { OrderEntity } from '../../../../domain/order/contracts/orderEntity';
import { ReviewEntity } from '../../../../domain/review/contracts/reviewEntity';
import { UserEntity } from '../../../../domain/user/contracts/userEntity';
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
    bookRepositoryFactory = container.get<BookRepositoryFactory>(bookSymbols.bookRepositoryFactory);
    dataSource = container.get<DataSource>(postgresSymbols.dataSource);

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
