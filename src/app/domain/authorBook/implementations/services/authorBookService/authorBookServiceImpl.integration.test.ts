import 'reflect-metadata';

import { describe, it, beforeAll, afterAll, expect, vi } from 'vitest';

import { SpyFactory } from '../../../../../common/testFactories/spyFactory';
import { TestTransactionInternalRunner } from '../../../../../integrations/common/tests/unitOfWork/testTransactionInternalRunner';
import { DependencyInjectionContainerFactory } from '../../../../../libs/dependencyInjection/implementations/factories/dependencyInjectionContainerFactory/dependencyInjectionContainerFactory';
import { LoggerModule } from '../../../../../libs/logger/loggerModule';
import { LoggerModuleConfigTestFactory } from '../../../../../libs/logger/tests/factories/loggerModuleConfigTestFactory/loggerModuleConfigTestFactory';
import { PostgresConnector } from '../../../../../libs/postgres/contracts/postgresConnector';
import { PostgresModule } from '../../../../../libs/postgres/postgresModule';
import { postgresSymbols } from '../../../../../libs/postgres/postgresSymbols';
import { PostgresModuleConfigTestFactory } from '../../../../../libs/postgres/tests/factories/postgresModuleConfigTestFactory/postgresModuleConfigTestFactory';
import { UnitOfWorkModule } from '../../../../../libs/unitOfWork/unitOfWorkModule';
import { AddressEntity } from '../../../../address/contracts/addressEntity';
import { AuthorModule } from '../../../../author/authorModule';
import { authorSymbols } from '../../../../author/authorSymbols';
import { AuthorEntity } from '../../../../author/contracts/authorEntity';
import { AuthorRepositoryFactory } from '../../../../author/contracts/factories/authorRepositoryFactory/authorRepositoryFactory';
import { AuthorEntityTestFactory } from '../../../../author/tests/factories/authorEntityTestFactory/authorEntityTestFactory';
import { BookModule } from '../../../../book/bookModule';
import { bookSymbols } from '../../../../book/bookSymbols';
import { BookEntity } from '../../../../book/contracts/bookEntity';
import { BookRepositoryFactory } from '../../../../book/contracts/factories/bookRepositoryFactory/bookRepositoryFactory';
import { BookEntityTestFactory } from '../../../../book/tests/factories/bookEntityTestFactory/bookEntityTestFactory';
import { BookCategoryEntity } from '../../../../bookCategory/contracts/bookCategoryEntity';
import { CategoryModule } from '../../../../category/categoryModule';
import { CategoryEntity } from '../../../../category/contracts/categoryEntity';
import { CustomerEntity } from '../../../../customer/contracts/customerEntity';
import { UserEntity } from '../../../../user/contracts/userEntity';
import { AuthorBookModule } from '../../../authorBookModule';
import { authorBookSymbols } from '../../../authorBookSymbols';
import { AuthorBookEntity } from '../../../contracts/authorBookEntity';
import { AuthorBookRepositoryFactory } from '../../../contracts/factories/authorBookRepositoryFactory/authorBookRepositoryFactory';
import { AuthorBookService } from '../../../contracts/services/authorBookService/authorBookService';
import { AuthorBookAlreadyExistsError } from '../../../errors/authorBookAlreadyExistsError';
import { AuthorBookNotFoundError } from '../../../errors/authorBookNotFoundError';
import { AuthorBookEntityTestFactory } from '../../../tests/factories/authorBookEntityTestFactory/authorBookEntityTestFactory';

describe('AuthorBookServiceImpl', () => {
  const spyFactory = new SpyFactory(vi);

  let authorBookService: AuthorBookService;
  let authorBookRepositoryFactory: AuthorBookRepositoryFactory;
  let authorRepositoryFactory: AuthorRepositoryFactory;
  let bookRepositoryFactory: BookRepositoryFactory;
  let testTransactionRunner: TestTransactionInternalRunner;
  let postgresConnector: PostgresConnector;

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
    ],
  });

  beforeAll(async () => {
    const container = await DependencyInjectionContainerFactory.create([
      new PostgresModule(postgresModuleConfig),
      new CategoryModule(),
      new BookModule(),
      new AuthorModule(),
      new AuthorBookModule(),
      new LoggerModule(loggerModuleConfig),
      new UnitOfWorkModule(),
    ]);

    authorBookService = container.resolve(authorBookSymbols.authorBookService);
    authorBookRepositoryFactory = container.resolve(authorBookSymbols.authorBookRepositoryFactory);
    authorRepositoryFactory = container.resolve(authorSymbols.authorRepositoryFactory);
    bookRepositoryFactory = container.resolve(bookSymbols.bookRepositoryFactory);
    postgresConnector = container.resolve(postgresSymbols.postgresConnector);

    testTransactionRunner = new TestTransactionInternalRunner(container);
  });

  afterAll(async () => {
    postgresConnector.closeConnection();
  });

  describe('Create authorBook', () => {
    it('creates authorBook in database', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const authorRepository = authorRepositoryFactory.create(entityManager);

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const authorBookRepository = authorBookRepositoryFactory.create(entityManager);

        const authorEntity = authorEntityTestFactory.create();

        const bookEntity = bookEntityTestFactory.create();

        const author = await authorRepository.createOne(authorEntity);

        const book = await bookRepository.createOne(bookEntity);

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

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const authorRepository = authorRepositoryFactory.create(entityManager);

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const authorEntity = authorEntityTestFactory.create();

        const bookEntity = bookEntityTestFactory.create();

        const author = await authorRepository.createOne(authorEntity);

        const book = await bookRepository.createOne(bookEntity);

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

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const authorRepository = authorRepositoryFactory.create(entityManager);

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const authorBookRepository = authorBookRepositoryFactory.create(entityManager);

        const authorEntity = authorEntityTestFactory.create();

        const bookEntity = bookEntityTestFactory.create();

        const { id } = authorBookEntityTestFactory.create();

        const author = await authorRepository.createOne(authorEntity);

        const book = await bookRepository.createOne(bookEntity);

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

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
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
