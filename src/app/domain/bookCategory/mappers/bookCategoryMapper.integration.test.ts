import { EntityManager } from 'typeorm';
import { BookCategory } from '../entities/bookCategory';
import { BookCategoryMapper } from './bookCategoryMapper';
import { ConfigLoader } from '../../../../configLoader';
import { createDIContainer } from '../../../shared';
import { DbModule } from '../../../shared';
import { BookCategoryModule } from '../bookCategoryModule';
import { PostgresHelper } from '../../../../integration/helpers/postgresHelper/postgresHelper';
import { AuthorTestDataGenerator } from '../../author/testDataGenerators/authorTestDataGenerator';
import { BookTestDataGenerator } from '../../book/testDataGenerators/bookTestDataGenerator';
import { Author } from '../../author/entities/author';
import { Book } from '../../book/entities/book';
import { LoggerModule } from '../../../shared/logger/loggerModule';
import { AUTHOR_BOOK_MAPPER } from '../bookCategoryInjectionSymbols';
import { ENTITY_MANAGER } from '../../../shared/db/dbInjectionSymbols';

describe('BookCategoryMapper', () => {
  let authorBookMapper: BookCategoryMapper;
  let authorTestDataGenerator: AuthorTestDataGenerator;
  let bookTestDataGenerator: BookTestDataGenerator;
  let entityManager: EntityManager;

  beforeAll(async () => {
    ConfigLoader.loadConfig();

    const container = await createDIContainer([DbModule, BookCategoryModule, LoggerModule]);

    authorBookMapper = container.resolve(AUTHOR_BOOK_MAPPER);
    entityManager = container.resolve(ENTITY_MANAGER);

    authorTestDataGenerator = new AuthorTestDataGenerator();
    bookTestDataGenerator = new BookTestDataGenerator();
  });

  afterEach(async () => {
    await PostgresHelper.removeDataFromTables();
  });

  describe('Map authorBook', () => {
    it('map authorBook from entity to dto', async () => {
      expect.assertions(1);

      const { firstName, lastName } = authorTestDataGenerator.generateData();

      const createdAuthor = entityManager.create(Author, {
        firstName,
        lastName,
      });

      const savedAuthor = await entityManager.save(createdAuthor);

      const { title, releaseYear, language, format, price, categoryId } = bookTestDataGenerator.generateData();

      const createdBook = entityManager.create(Book, {
        title,
        releaseYear,
        language,
        format,
        price,
        categoryId,
      });

      const savedBook = await entityManager.save(createdBook);

      const createdBookCategory = entityManager.create(BookCategory, {
        authorId: savedAuthor.id,
        bookId: savedBook.id,
      });

      const savedBookCategory = await entityManager.save(createdBookCategory);

      const authorBookDto = authorBookMapper.mapEntityToDto(savedBookCategory);

      expect(authorBookDto).toEqual({
        id: savedBookCategory.id,
        createdAt: savedBookCategory.createdAt,
        updatedAt: savedBookCategory.updatedAt,
        authorId: savedAuthor.id,
        bookId: savedBook.id,
      });
    });
  });
});
