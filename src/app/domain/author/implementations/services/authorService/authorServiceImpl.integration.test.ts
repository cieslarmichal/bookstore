import { ConfigLoader } from '../../../../../../configLoader';
import { EqualFilter } from '../../../../../common/filter/equalFilter';
import { postgresConnector } from '../../../../../libs/postgres/postgresConnector';
import { PostgresModule } from '../../../../../libs/postgres/postgresModule';
import { createDependencyInjectionContainer } from '../../../../../libs/dependencyInjection/container';
import { LoggerModule } from '../../../../../libs/logger/loggerModule';
import { UnitOfWorkModule } from '../../../../../libs/unitOfWork/unitOfWorkModule';
import { TestTransactionInternalRunner } from '../../../../../tests/helpers';
import { AuthorBookModule } from '../../../../authorBook/authorBookModule';
import { BookModule } from '../../../../book/bookModule';
import { BookTestDataGenerator } from '../../../../book/tests/bookEntityTestDataGenerator/bookEntityTestDataGenerator';
import { AuthorModule } from '../../../authorModule';
import { AuthorRepositoryFactory } from '../../../contracts/factories/authorRepositoryFactory/authorRepositoryFactory';
import { AuthorService } from '../../../contracts/services/authorService/authorService';
import { AuthorNotFound } from '../../../errors/authorNotFound';
import { AuthorEntityTestFactory } from '../../../tests/factories/authorEntityTestFactory/authorEntityTestFactory';
import { AuthorBookRepositoryFactory } from '../../../../authorBook/contracts/factories/authorBookRepositoryFactory/authorBookRepositoryFactory';
import { BookRepositoryFactory } from '../../../../book/contracts/factories/bookRepositoryFactory/bookRepositoryFactory';
import { authorSymbols } from '../../../authorSymbols';
import { bookSymbols } from '../../../../book/bookSymbols';
import { authorBookSymbols } from '../../../../authorBook/authorBookSymbols';

describe('AuthorServiceImpl', () => {
  let authorService: AuthorService;
  let authorRepositoryFactory: AuthorRepositoryFactory;
  let bookRepositoryFactory: BookRepositoryFactory;
  let authorBookRepositoryFactory: AuthorBookRepositoryFactory;
  let testTransactionRunner: TestTransactionInternalRunner;

  const authorTestDataGenerator = new AuthorEntityTestFactory();
  const bookTestDataGenerator = new BookTestDataGenerator();

  beforeAll(async () => {
    ConfigLoader.loadConfig();

    const container = await createDependencyInjectionContainer([
      PostgresModule,
      BookModule,
      AuthorModule,
      AuthorBookModule,
      LoggerModule,
      UnitOfWorkModule,
    ]);

    authorService = container.resolve(authorSymbols.authorService);
    authorRepositoryFactory = container.resolve(authorSymbols.authorRepositoryFactory);
    bookRepositoryFactory = container.resolve(bookSymbols.bookRepositoryFactory);
    authorBookRepositoryFactory = container.resolve(authorBookSymbols.authorBookRepositoryFactory);

    testTransactionRunner = new TestTransactionInternalRunner(container);
  });

  afterAll(async () => {
    postgresConnector.closeConnection();
  });

  describe('Create author', () => {
    it('creates author in database', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const { firstName, lastName } = authorTestDataGenerator.create();

        const createdAuthorDto = await authorService.createAuthor(unitOfWork, { firstName, lastName });

        const authorRepository = authorRepositoryFactory.create(entityManager);

        const authorDto = await authorRepository.findOneById(createdAuthorDto.id);

        expect(authorDto).not.toBeNull();
      });
    });
  });

  describe('Find author', () => {
    it('finds author by id in database', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const { firstName, lastName } = authorTestDataGenerator.create();

        const authorRepository = authorRepositoryFactory.create(entityManager);

        const author = await authorRepository.createOne({ firstName, lastName });

        const foundAuthor = await authorService.findAuthor(unitOfWork, author.id);

        expect(foundAuthor).not.toBeNull();
      });
    });

    it('should throw if author with given id does not exist in db', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { id } = authorTestDataGenerator.create();

        try {
          await authorService.findAuthor(unitOfWork, id);
        } catch (error) {
          expect(error).toBeInstanceOf(AuthorNotFound);
        }
      });
    });
  });

  describe('Find authors', () => {
    it('finds authors by one condition in database', async () => {
      expect.assertions(2);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const { firstName, lastName } = authorTestDataGenerator.create();

        const authorRepository = authorRepositoryFactory.create(entityManager);

        const author = await authorRepository.createOne({ firstName, lastName });

        const { firstName: otherFirstName, lastName: otherLastName } = authorTestDataGenerator.create();

        await authorRepository.createOne({ firstName: otherFirstName, lastName: otherLastName });

        const foundAuthors = await authorService.findAuthors(unitOfWork, [new EqualFilter('firstName', [firstName])], {
          page: 1,
          limit: 5,
        });

        expect(foundAuthors.length).toBe(1);
        expect(foundAuthors[0]).toStrictEqual(author);
      });
    });

    it('finds authors by two conditions in database', async () => {
      expect.assertions(2);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const { firstName, lastName } = authorTestDataGenerator.create();

        const authorRepository = authorRepositoryFactory.create(entityManager);

        const author = await authorRepository.createOne({ firstName, lastName });

        const { firstName: otherFirstName, lastName: otherLastName } = authorTestDataGenerator.create();

        await authorRepository.createOne({ firstName: otherFirstName, lastName: otherLastName });

        const foundAuthors = await authorService.findAuthors(
          unitOfWork,
          [new EqualFilter('firstName', [firstName]), new EqualFilter('lastName', [lastName])],
          {
            page: 1,
            limit: 5,
          },
        );

        expect(foundAuthors.length).toBe(1);
        expect(foundAuthors[0]).toStrictEqual(author);
      });
    });

    it('finds authors in database limited by pagination', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const { firstName, lastName } = authorTestDataGenerator.create();

        const authorRepository = authorRepositoryFactory.create(entityManager);

        await authorRepository.createOne({ firstName, lastName });

        const { lastName: otherLastName } = authorTestDataGenerator.create();

        await authorRepository.createOne({ firstName, lastName: otherLastName });

        const { lastName: anotherLastName } = authorTestDataGenerator.create();

        await authorRepository.createOne({ firstName, lastName: anotherLastName });

        const foundAuthors = await authorService.findAuthors(unitOfWork, [new EqualFilter('firstName', [firstName])], {
          page: 1,
          limit: 2,
        });

        expect(foundAuthors.length).toBe(2);
      });
    });
  });

  describe('Find authors by book id', () => {
    it('finds authors by book id with filtering in database', async () => {
      expect.assertions(4);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const authorRepository = authorRepositoryFactory.create(entityManager);
        const bookRepository = bookRepositoryFactory.create(entityManager);
        const authorBookRepository = authorBookRepositoryFactory.create(entityManager);

        const { title, releaseYear, language, format, price } = bookTestDataGenerator.generateData();

        const book = await bookRepository.createOne({
          title,
          releaseYear,
          language,
          format,
          price,
        });

        const firstAuthorData = authorTestDataGenerator.create();

        const firstAuthor = await authorRepository.createOne({
          firstName: firstAuthorData.firstName,
          lastName: firstAuthorData.lastName,
        });

        const secondAuthorData = authorTestDataGenerator.create();

        const secondAuthor = await authorRepository.createOne({
          firstName: secondAuthorData.firstName,
          lastName: secondAuthorData.lastName,
        });

        const thirdAuthorData = authorTestDataGenerator.create();

        await authorRepository.createOne({
          firstName: thirdAuthorData.firstName,
          lastName: thirdAuthorData.lastName,
        });

        await authorBookRepository.createOne({ bookId: book.id, authorId: firstAuthor.id });
        await authorBookRepository.createOne({ bookId: book.id, authorId: secondAuthor.id });

        const foundAuthors = await authorService.findAuthorsByBookId(
          unitOfWork,
          book.id,
          [new EqualFilter('firstName', [firstAuthor.firstName])],
          { page: 1, limit: 5 },
        );

        expect(foundAuthors).not.toBeNull();
        expect(foundAuthors.length).toBe(1);
        expect(foundAuthors[0].firstName).toBe(firstAuthor.firstName);
        expect(foundAuthors[0].lastName).toBe(firstAuthor.lastName);
      });
    });
  });

  describe('Update author', () => {
    it('updates author in database', async () => {
      expect.assertions(2);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const authorRepository = authorRepositoryFactory.create(entityManager);

        const { firstName, lastName, about } = authorTestDataGenerator.create();

        const author = await authorRepository.createOne({ firstName, lastName });

        const updatedAuthor = await authorService.updateAuthor(unitOfWork, author.id, { about });

        expect(updatedAuthor).not.toBeNull();
        expect(updatedAuthor.about).toBe(about);
      });
    });

    it('should not update author and throw if author with given id does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { id, about } = authorTestDataGenerator.create();

        try {
          await authorService.updateAuthor(unitOfWork, id, { about });
        } catch (error) {
          expect(error).toBeInstanceOf(AuthorNotFound);
        }
      });
    });
  });

  describe('Remove author', () => {
    it('removes author from database', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const authorRepository = authorRepositoryFactory.create(entityManager);

        const { firstName, lastName } = authorTestDataGenerator.create();

        const author = await authorRepository.createOne({ firstName, lastName });

        await authorService.removeAuthor(unitOfWork, author.id);

        const authorDto = await authorRepository.findOneById(author.id);

        expect(authorDto).toBeNull();
      });
    });

    it('should throw if author with given id does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { id } = authorTestDataGenerator.create();

        try {
          await authorService.removeAuthor(unitOfWork, id);
        } catch (error) {
          expect(error).toBeInstanceOf(AuthorNotFound);
        }
      });
    });
  });
});
