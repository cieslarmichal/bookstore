import { AuthorBook } from '../entities/authorBook';
import { AuthorBookMapper } from './authorBookMapper';
import { ConfigLoader } from '../../../../configLoader';
import { createDIContainer, UnitOfWorkModule } from '../../../shared';
import { DbModule } from '../../../shared';
import { AuthorBookModule } from '../authorBookModule';
import { AuthorModule } from '../../author/authorModule';
import { TestTransactionRunner } from '../../../../integration/helpers/unitOfWorkHelper/testTransactionRunner';
import { AuthorTestDataGenerator } from '../../author/testDataGenerators/authorTestDataGenerator';
import { BookTestDataGenerator } from '../../book/testDataGenerators/bookTestDataGenerator';
import { Author } from '../../author/entities/author';
import { Book } from '../../book/entities/book';
import { LoggerModule } from '../../../shared/logger/loggerModule';
import { AUTHOR_BOOK_MAPPER } from '../authorBookInjectionSymbols';

describe('AuthorBookMapper', () => {
  let authorBookMapper: AuthorBookMapper;
  let authorTestDataGenerator: AuthorTestDataGenerator;
  let bookTestDataGenerator: BookTestDataGenerator;
  let testTransactionRunner: TestTransactionRunner;

  beforeAll(async () => {
    ConfigLoader.loadConfig();

    const container = await createDIContainer([
      DbModule,
      AuthorBookModule,
      AuthorModule,
      LoggerModule,
      UnitOfWorkModule,
    ]);

    authorBookMapper = container.resolve(AUTHOR_BOOK_MAPPER);

    testTransactionRunner = new TestTransactionRunner(container);

    authorTestDataGenerator = new AuthorTestDataGenerator();
    bookTestDataGenerator = new BookTestDataGenerator();
  });

  describe('Map authorBook', () => {
    it('map authorBook from entity to dto', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const { firstName, lastName } = authorTestDataGenerator.generateData();

        const createdAuthor = entityManager.create(Author, {
          firstName,
          lastName,
        });

        const savedAuthor = await entityManager.save(createdAuthor);

        const { title, releaseYear, language, format, price } = bookTestDataGenerator.generateData();

        const createdBook = entityManager.create(Book, {
          title,
          releaseYear,
          language,
          format,
          price,
        });

        const savedBook = await entityManager.save(createdBook);

        const createdAuthorBook = entityManager.create(AuthorBook, {
          authorId: savedAuthor.id,
          bookId: savedBook.id,
        });

        const savedAuthorBook = await entityManager.save(createdAuthorBook);

        const authorBookDto = authorBookMapper.mapEntityToDto(savedAuthorBook);

        expect(authorBookDto).toEqual({
          id: savedAuthorBook.id,
          createdAt: savedAuthorBook.createdAt,
          updatedAt: savedAuthorBook.updatedAt,
          authorId: savedAuthor.id,
          bookId: savedBook.id,
        });
      });
    });
  });
});
