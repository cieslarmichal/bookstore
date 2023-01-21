import { ConfigLoader } from '../../../../../../configLoader';
import { postgresConnector } from '../../../../../libs/postgres/postgresConnector';
import { PostgresModule } from '../../../../../libs/postgres/postgresModule';
import { createDependencyInjectionContainer } from '../../../../../libs/dependencyInjection/container';
import { LoggerModule } from '../../../../../libs/logger/loggerModule';
import { UnitOfWorkModule } from '../../../../../libs/unitOfWork/unitOfWorkModule';
import { TestTransactionInternalRunner } from '../../../../../tests/helpers';
import { AuthorModule } from '../../../../author/authorModule';
import { AuthorRepositoryFactory } from '../../../../author/contracts/factories/authorRepositoryFactory/authorRepositoryFactory';
import { BookModule } from '../../../../book/bookModule';
import { CategoryModule } from '../../../../category/categoryModule';
import { AuthorBookModule } from '../../../authorBookModule';
import { AuthorBookAlreadyExists } from '../../../errors/authorBookAlreadyExists';
import { AuthorBookNotFound } from '../../../errors/authorBookNotFound';
import { AuthorBookRepositoryFactory } from '../../factories/authorBookRepositoryFactory/authorBookRepositoryFactory';
import { AuthorBookService } from './authorBookService';

describe('AuthorBookService', () => {
  let authorBookService: AuthorBookService;
  let authorBookRepositoryFactory: AuthorBookRepositoryFactory;
  let authorRepositoryFactory: AuthorRepositoryFactory;
  let bookRepositoryFactory: BookRepositoryFactory;
  let authorBookEntityTestFactory: AuthorBookTestDataGenerator;
  let authorEntityTestFactory: AuthorEntityTestFactory;
  let bookEntityTestFactory: BookEntityTestFactory;
  let testTransactionRunner: TestTransactionInternalRunner;

  beforeAll(async () => {
    ConfigLoader.loadConfig();

    const container = await createDependencyInjectionContainer([
      PostgresModule,
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

    authorBookEntityTestFactory = new AuthorBookTestDataGenerator();
    authorEntityTestFactory = new AuthorEntityTestFactory();
    bookEntityTestFactory = new BookEntityTestFactory();
  });

  afterAll(async () => {
    postgresConnector.closeConnection();
  });

  describe('Create authorBook', () => {
    it('creates authorBook in database', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const authorRepository = authorRepositoryFactory.create(entityManager);
        const bookRepository = bookRepositoryFactory.create(entityManager);
        const authorBookRepository = authorBookRepositoryFactory.create(entityManager);

        const { firstName, lastName } = authorEntityTestFactory.create();

        const author = await authorRepository.createOne({
          firstName,
          lastName,
        });

        const { title, releaseYear, language, format, price } = bookEntityTestFactory.create();

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

        const { firstName, lastName } = authorEntityTestFactory.create();

        const author = await authorRepository.createOne({
          firstName,
          lastName,
        });

        const { title, releaseYear, language, format, price } = bookEntityTestFactory.create();

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

        const { firstName, lastName } = authorEntityTestFactory.create();

        const author = await authorRepository.createOne({
          firstName,
          lastName,
        });

        const { title, releaseYear, language, format, price } = bookEntityTestFactory.create();

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
        const { authorId, bookId } = authorBookEntityTestFactory.create();

        try {
          await authorBookService.removeAuthorBook(unitOfWork, { authorId, bookId });
        } catch (error) {
          expect(error).toBeInstanceOf(AuthorBookNotFound);
        }
      });
    });
  });
});
