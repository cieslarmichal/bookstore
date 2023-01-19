import { ConfigLoader } from '../../../../../../configLoader';
import { dbManager } from '../../../../../libs/db/dbManager';
import { DbModule } from '../../../../../libs/db/dbModule';
import { createDIContainer } from '../../../../../libs/di/container';
import { LoggerModule } from '../../../../../libs/logger/loggerModule';
import { UnitOfWorkModule } from '../../../../../libs/unitOfWork/unitOfWorkModule';
import { TestTransactionInternalRunner } from '../../../../../tests/helpers';
import { AuthorModule } from '../../../../author/authorModule';
import { AuthorRepositoryFactory } from '../../../../author/contracts/factories/authorRepositoryFactory/authorRepositoryFactory';
import { BOOK_REPOSITORY_FACTORY } from '../../../../book/bookInjectionSymbols';
import { BookModule } from '../../../../book/bookModule';
import { BookRepositoryFactory } from '../../../../book/repositories/bookRepositoryFactory';
import { BookTestDataGenerator } from '../../../../book/testDataGenerators/bookTestDataGenerator';
import { CategoryModule } from '../../../../category/categoryModule';
import { AuthorBookModule } from '../../../authorBookModule';
import { AuthorBookRepositoryFactory } from '../../../contracts/factories/authorBookRepositoryFactory/authorBookRepositoryFactory';
import { AuthorBookService } from '../../../contracts/services/authorBookService/authorBookService';
import { AuthorBookAlreadyExists } from '../../../errors/authorBookAlreadyExists';
import { AuthorBookNotFound } from '../../../errors/authorBookNotFound';

describe('AuthorBookServiceImpl', () => {
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
