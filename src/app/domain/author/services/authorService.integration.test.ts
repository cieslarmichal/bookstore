import { ConfigLoader } from '../../../../configLoader';
import { createDependencyInjectionContainer, postgresConnector, EqualFilter, UnitOfWorkModule } from '../../../common';
import { PostgresModule } from '../../../common';
import { AuthorTestDataGenerator } from '../testDataGenerators/authorTestDataGenerator';
import { AuthorService } from './authorService';
import { AuthorModule } from '../authorModule';
import { BookModule } from '../../book/bookModule';
import { AuthorNotFound } from '../errors';
import { TestTransactionInternalRunner } from '../../../../integration/helpers/unitOfWorkHelper/testTransactionInternalRunner';
import { AuthorBookModule } from '../../authorBook/authorBookModule';
import { BookTestDataGenerator } from '../../book/tests/bookEntityTestDataGenerator/bookEntityTestDataGenerator';
import { LoggerModule } from '../../../common/logger/loggerModule';
import { AUTHOR_REPOSITORY_FACTORY, AUTHOR_SERVICE } from '../authorSymbols';
import { BOOK_REPOSITORY_FACTORY } from '../../book/bookSymbols';
import { AUTHOR_BOOK_REPOSITORY_FACTORY } from '../../authorBook/authorBookSymbols';
import { AuthorRepositoryFactory } from '../repositories/authorRepositoryFactory';
import { BookRepositoryFactory } from '../../book/repositories/bookRepositoryFactory';
import { AuthorBookRepositoryFactory } from '../../authorBook/repositories/authorBookRepositoryFactory';

describe('AuthorService', () => {
  let authorService: AuthorService;
  let authorRepositoryFactory: AuthorRepositoryFactory;
  let bookRepositoryFactory: BookRepositoryFactory;
  let authorBookRepositoryFactory: AuthorBookRepositoryFactory;
  let authorTestDataGenerator: AuthorTestDataGenerator;
  let bookTestDataGenerator: BookTestDataGenerator;
  let testTransactionRunner: TestTransactionInternalRunner;

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

    authorService = container.resolve(AUTHOR_SERVICE);
    authorRepositoryFactory = container.resolve(AUTHOR_REPOSITORY_FACTORY);
    bookRepositoryFactory = container.resolve(BOOK_REPOSITORY_FACTORY);
    authorBookRepositoryFactory = container.resolve(AUTHOR_BOOK_REPOSITORY_FACTORY);

    testTransactionRunner = new TestTransactionInternalRunner(container);

    authorTestDataGenerator = new AuthorTestDataGenerator();
    bookTestDataGenerator = new BookTestDataGenerator();
  });

  afterAll(async () => {
    postgresConnector.closeConnection();
  });

  describe('Create author', () => {
    it('creates author in database', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const { firstName, lastName } = authorTestDataGenerator.generateData();

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

        const { firstName, lastName } = authorTestDataGenerator.generateData();

        const authorRepository = authorRepositoryFactory.create(entityManager);

        const author = await authorRepository.createOne({ firstName, lastName });

        const foundAuthor = await authorService.findAuthor(unitOfWork, author.id);

        expect(foundAuthor).not.toBeNull();
      });
    });

    it('should throw if author with given id does not exist in db', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { id } = authorTestDataGenerator.generateData();

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

        const { firstName, lastName } = authorTestDataGenerator.generateData();

        const authorRepository = authorRepositoryFactory.create(entityManager);

        const author = await authorRepository.createOne({ firstName, lastName });

        const { firstName: otherFirstName, lastName: otherLastName } = authorTestDataGenerator.generateData();

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

        const { firstName, lastName } = authorTestDataGenerator.generateData();

        const authorRepository = authorRepositoryFactory.create(entityManager);

        const author = await authorRepository.createOne({ firstName, lastName });

        const { firstName: otherFirstName, lastName: otherLastName } = authorTestDataGenerator.generateData();

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

        const { firstName, lastName } = authorTestDataGenerator.generateData();

        const authorRepository = authorRepositoryFactory.create(entityManager);

        await authorRepository.createOne({ firstName, lastName });

        const { lastName: otherLastName } = authorTestDataGenerator.generateData();

        await authorRepository.createOne({ firstName, lastName: otherLastName });

        const { lastName: anotherLastName } = authorTestDataGenerator.generateData();

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

        const firstAuthorData = authorTestDataGenerator.generateData();

        const firstAuthor = await authorRepository.createOne({
          firstName: firstAuthorData.firstName,
          lastName: firstAuthorData.lastName,
        });

        const secondAuthorData = authorTestDataGenerator.generateData();

        const secondAuthor = await authorRepository.createOne({
          firstName: secondAuthorData.firstName,
          lastName: secondAuthorData.lastName,
        });

        const thirdAuthorData = authorTestDataGenerator.generateData();

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

        const { firstName, lastName, about } = authorTestDataGenerator.generateData();

        const author = await authorRepository.createOne({ firstName, lastName });

        const updatedAuthor = await authorService.updateAuthor(unitOfWork, author.id, { about });

        expect(updatedAuthor).not.toBeNull();
        expect(updatedAuthor.about).toBe(about);
      });
    });

    it('should not update author and throw if author with given id does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { id, about } = authorTestDataGenerator.generateData();

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

        const { firstName, lastName } = authorTestDataGenerator.generateData();

        const author = await authorRepository.createOne({ firstName, lastName });

        await authorService.removeAuthor(unitOfWork, author.id);

        const authorDto = await authorRepository.findOneById(author.id);

        expect(authorDto).toBeNull();
      });
    });

    it('should throw if author with given id does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { id } = authorTestDataGenerator.generateData();

        try {
          await authorService.removeAuthor(unitOfWork, id);
        } catch (error) {
          expect(error).toBeInstanceOf(AuthorNotFound);
        }
      });
    });
  });
});
