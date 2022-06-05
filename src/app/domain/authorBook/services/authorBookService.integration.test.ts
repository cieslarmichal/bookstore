import { AuthorBookService } from './authorBookService';
import { AuthorBookTestDataGenerator } from '../testDataGenerators/authorBookTestDataGenerator';
import { ConfigLoader } from '../../../../configLoader';
import { createDIContainer, dbManager, UnitOfWorkModule } from '../../../shared';
import { DbModule } from '../../../shared';
import { AuthorBookModule } from '../authorBookModule';
import { AuthorModule } from '../../author/authorModule';
import { AuthorBookAlreadyExists, AuthorBookNotFound } from '../errors';
import { TestTransactionInternalRunner } from '../../../../integration/helpers/unitOfWorkHelper/testTransactionInternalRunner';
import { BookModule } from '../../book/bookModule';
import { CategoryModule } from '../../category/categoryModule';
import { AuthorTestDataGenerator } from '../../author/testDataGenerators/authorTestDataGenerator';
import { BookTestDataGenerator } from '../../book/testDataGenerators/bookTestDataGenerator';
import { LoggerModule } from '../../../shared/logger/loggerModule';
import { AUTHOR_BOOK_REPOSITORY_FACTORY, AUTHOR_BOOK_SERVICE } from '../authorBookInjectionSymbols';
import { AUTHOR_REPOSITORY_FACTORY } from '../../author/authorInjectionSymbols';
import { BOOK_REPOSITORY_FACTORY } from '../../book/bookInjectionSymbols';
import { AuthorBookRepositoryFactory } from '../repositories/authorBookRepositoryFactory';
import { AuthorRepositoryFactory } from '../../author/repositories/authorRepositoryFactory';
import { BookRepositoryFactory } from '../../book/repositories/bookRepositoryFactory';

describe('AuthorBookService', () => {
  let authorBookService: AuthorBookService;
  let authorBookRepositoryFactory: AuthorBookRepositoryFactory;
  let authorRepositoryFactory: AuthorRepositoryFactory;
  let bookRepositoryFactory: BookRepositoryFactory;
  let authorBookTestDataGenerator: AuthorBookTestDataGenerator;
  let authorTestDataGenerator: AuthorTestDataGenerator;
  let bookTestDataGenerator: BookTestDataGenerator;
  let testTransactionRunner: TestTransactionInternalRunner;

  beforeAll(async () => {
    ConfigLoader.loadConfig();

    const container = await createDIContainer([
      DbModule,
      CategoryModule,
      BookModule,
      AuthorModule,
      AuthorBookModule,
      LoggerModule,
      UnitOfWorkModule,
    ]);

    authorBookService = container.resolve(AUTHOR_BOOK_SERVICE);
    authorBookRepositoryFactory = container.resolve(AUTHOR_BOOK_REPOSITORY_FACTORY);
    authorRepositoryFactory = container.resolve(AUTHOR_REPOSITORY_FACTORY);
    bookRepositoryFactory = container.resolve(BOOK_REPOSITORY_FACTORY);

    testTransactionRunner = new TestTransactionInternalRunner(container);

    authorBookTestDataGenerator = new AuthorBookTestDataGenerator();
    authorTestDataGenerator = new AuthorTestDataGenerator();
    bookTestDataGenerator = new BookTestDataGenerator();
  });

  afterAll(async () => {
    dbManager.closeConnection();
  });

  describe('Create authorBook', () => {
    it('creates authorBook in database', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const authorRepository = authorRepositoryFactory.create(entityManager);
        const bookRepository = bookRepositoryFactory.create(entityManager);
        const authorBookRepository = authorBookRepositoryFactory.create(entityManager);

        const { firstName, lastName } = authorTestDataGenerator.generateData();

        const author = await authorRepository.createOne({
          firstName,
          lastName,
        });

        const { title, releaseYear, language, format, price } = bookTestDataGenerator.generateData();

        const book = await bookRepository.createOne({
          title,
          releaseYear,
          language,
          format,
          price,
        });

        const createdAuthorBookDto = await authorBookService.createAuthorBook(unitOfWork, {
          authorId: author.id,
          bookId: book.id,
        });

        const authorBookDto = await authorBookRepository.findOneById(createdAuthorBookDto.id);

        expect(authorBookDto).not.toBeNull();
      });
    });

    it('should not create authorBook and throw if authorBook with the authorId and bookId exists', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const authorRepository = authorRepositoryFactory.create(entityManager);
        const bookRepository = bookRepositoryFactory.create(entityManager);

        const { firstName, lastName } = authorTestDataGenerator.generateData();

        const author = await authorRepository.createOne({
          firstName,
          lastName,
        });

        const { title, releaseYear, language, format, price } = bookTestDataGenerator.generateData();

        const book = await bookRepository.createOne({
          title,
          releaseYear,
          language,
          format,
          price,
        });

        await authorBookService.createAuthorBook(unitOfWork, {
          authorId: author.id,
          bookId: book.id,
        });

        try {
          await authorBookService.createAuthorBook(unitOfWork, {
            authorId: author.id,
            bookId: book.id,
          });
        } catch (error) {
          expect(error).toBeInstanceOf(AuthorBookAlreadyExists);
        }
      });
    });
  });

  describe('Remove authorBook', () => {
    it('removes authorBook from database', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const authorRepository = authorRepositoryFactory.create(entityManager);
        const bookRepository = bookRepositoryFactory.create(entityManager);
        const authorBookRepository = authorBookRepositoryFactory.create(entityManager);

        const { firstName, lastName } = authorTestDataGenerator.generateData();

        const author = await authorRepository.createOne({
          firstName,
          lastName,
        });

        const { title, releaseYear, language, format, price } = bookTestDataGenerator.generateData();

        const book = await bookRepository.createOne({
          title,
          releaseYear,
          language,
          format,
          price,
        });

        const authorBook = await authorBookRepository.createOne({
          authorId: author.id,
          bookId: book.id,
        });

        await authorBookService.removeAuthorBook(unitOfWork, { authorId: author.id, bookId: book.id });

        const authorBookDto = await authorBookRepository.findOneById(authorBook.id);

        expect(authorBookDto).toBeNull();
      });
    });

    it('should throw if authorBook with given id does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { authorId, bookId } = authorBookTestDataGenerator.generateData();

        try {
          await authorBookService.removeAuthorBook(unitOfWork, { authorId, bookId });
        } catch (error) {
          expect(error).toBeInstanceOf(AuthorBookNotFound);
        }
      });
    });
  });
});
