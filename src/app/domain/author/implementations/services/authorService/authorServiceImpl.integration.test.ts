import { describe, it, beforeAll, afterAll, expect } from 'vitest';

import { ConfigLoader } from '../../../../../../configLoader';
import { EqualFilter } from '../../../../../common/filter/equalFilter';
import { createDependencyInjectionContainer } from '../../../../../libs/dependencyInjection/container';
import { LoggerModule } from '../../../../../libs/logger/loggerModule';
import { postgresConnector } from '../../../../../libs/postgres/postgresConnector';
import { PostgresModule } from '../../../../../libs/postgres/postgresModule';
import { UnitOfWorkModule } from '../../../../../libs/unitOfWork/unitOfWorkModule';
import { TestTransactionInternalRunner } from '../../../../../tests/unitOfWork/testTransactionInternalRunner';
import { AuthorBookModule } from '../../../../authorBook/authorBookModule';
import { authorBookSymbols } from '../../../../authorBook/authorBookSymbols';
import { AuthorBookRepositoryFactory } from '../../../../authorBook/contracts/factories/authorBookRepositoryFactory/authorBookRepositoryFactory';
import { BookModule } from '../../../../book/bookModule';
import { bookSymbols } from '../../../../book/bookSymbols';
import { BookRepositoryFactory } from '../../../../book/contracts/factories/bookRepositoryFactory/bookRepositoryFactory';
import { BookEntityTestFactory } from '../../../../book/tests/factories/bookEntityTestFactory/bookEntityTestFactory';
import { AuthorModule } from '../../../authorModule';
import { authorSymbols } from '../../../authorSymbols';
import { AuthorRepositoryFactory } from '../../../contracts/factories/authorRepositoryFactory/authorRepositoryFactory';
import { AuthorService } from '../../../contracts/services/authorService/authorService';
import { AuthorNotFoundError } from '../../../errors/authorNotFoundError';
import { AuthorEntityTestFactory } from '../../../tests/factories/authorEntityTestFactory/authorEntityTestFactory';

describe('AuthorServiceImpl', () => {
  let authorService: AuthorService;
  let authorRepositoryFactory: AuthorRepositoryFactory;
  let bookRepositoryFactory: BookRepositoryFactory;
  let authorBookRepositoryFactory: AuthorBookRepositoryFactory;
  let testTransactionRunner: TestTransactionInternalRunner;

  const authorEntityTestFactory = new AuthorEntityTestFactory();
  const bookEntityTestFactory = new BookEntityTestFactory();

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

        const { firstName, lastName } = authorEntityTestFactory.create();

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

        const { firstName, lastName } = authorEntityTestFactory.create();

        const authorRepository = authorRepositoryFactory.create(entityManager);

        const author = await authorRepository.createOne({ firstName, lastName });

        const foundAuthor = await authorService.findAuthor(unitOfWork, author.id);

        expect(foundAuthor).not.toBeNull();
      });
    });

    it('should throw if author with given id does not exist in db', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { id } = authorEntityTestFactory.create();

        try {
          await authorService.findAuthor(unitOfWork, id);
        } catch (error) {
          expect(error).toBeInstanceOf(AuthorNotFoundError);
        }
      });
    });
  });

  describe('Find authors', () => {
    it('finds authors by one condition in database', async () => {
      expect.assertions(2);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const { firstName, lastName } = authorEntityTestFactory.create();

        const authorRepository = authorRepositoryFactory.create(entityManager);

        const author = await authorRepository.createOne({ firstName, lastName });

        const { firstName: otherFirstName, lastName: otherLastName } = authorEntityTestFactory.create();

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

        const { firstName, lastName } = authorEntityTestFactory.create();

        const authorRepository = authorRepositoryFactory.create(entityManager);

        const author = await authorRepository.createOne({ firstName, lastName });

        const { firstName: otherFirstName, lastName: otherLastName } = authorEntityTestFactory.create();

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

        const { firstName, lastName } = authorEntityTestFactory.create();

        const authorRepository = authorRepositoryFactory.create(entityManager);

        await authorRepository.createOne({ firstName, lastName });

        const { lastName: otherLastName } = authorEntityTestFactory.create();

        await authorRepository.createOne({ firstName, lastName: otherLastName });

        const { lastName: anotherLastName } = authorEntityTestFactory.create();

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
      expect.assertions(3);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const authorRepository = authorRepositoryFactory.create(entityManager);
        const bookRepository = bookRepositoryFactory.create(entityManager);
        const authorBookRepository = authorBookRepositoryFactory.create(entityManager);

        const { title, releaseYear, language, format, price } = bookEntityTestFactory.create();

        const book = await bookRepository.createOne({
          title,
          releaseYear,
          language,
          format,
          price,
        });

        const firstAuthorData = authorEntityTestFactory.create();

        const firstAuthor = await authorRepository.createOne({
          firstName: firstAuthorData.firstName,
          lastName: firstAuthorData.lastName,
        });

        const secondAuthorData = authorEntityTestFactory.create();

        const secondAuthor = await authorRepository.createOne({
          firstName: secondAuthorData.firstName,
          lastName: secondAuthorData.lastName,
        });

        const thirdAuthorData = authorEntityTestFactory.create();

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

        expect(foundAuthors.length).toBe(1);
        expect(foundAuthors[0]?.firstName).toBe(firstAuthor.firstName);
        expect(foundAuthors[0]?.lastName).toBe(firstAuthor.lastName);
      });
    });
  });

  describe('Update author', () => {
    it('updates author in database', async () => {
      expect.assertions(2);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const authorRepository = authorRepositoryFactory.create(entityManager);

        const { firstName, lastName, about } = authorEntityTestFactory.create();

        const author = await authorRepository.createOne({ firstName, lastName });

        const updatedAuthor = await authorService.updateAuthor(unitOfWork, author.id, { about });

        expect(updatedAuthor).not.toBeNull();
        expect(updatedAuthor.about).toBe(about);
      });
    });

    it('should not update author and throw if author with given id does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { id, about } = authorEntityTestFactory.create();

        try {
          await authorService.updateAuthor(unitOfWork, id, { about });
        } catch (error) {
          expect(error).toBeInstanceOf(AuthorNotFoundError);
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

        const { firstName, lastName } = authorEntityTestFactory.create();

        const author = await authorRepository.createOne({ firstName, lastName });

        await authorService.removeAuthor(unitOfWork, author.id);

        const authorDto = await authorRepository.findOneById(author.id);

        expect(authorDto).toBeNull();
      });
    });

    it('should throw if author with given id does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { id } = authorEntityTestFactory.create();

        try {
          await authorService.removeAuthor(unitOfWork, id);
        } catch (error) {
          expect(error).toBeInstanceOf(AuthorNotFoundError);
        }
      });
    });
  });
});
