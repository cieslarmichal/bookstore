import { EntityManager } from 'typeorm';
import { AuthorBook } from '../entities/authorBook';
import { AuthorBookMapper } from './authorBookMapper';
import { ConfigLoader } from '../../../../configLoader';
import { createDIContainer } from '../../../shared';
import { DbModule } from '../../../shared';
import { AuthorBookModule } from '../authorBookModule';
import { AuthorModule } from '../../author/authorModule';
import { PostgresHelper } from '../../../../integration/helpers/postgresHelper/postgresHelper';
import { AuthorTestDataGenerator } from '../../author/testDataGenerators/authorTestDataGenerator';
import { BookTestDataGenerator } from '../../book/testDataGenerators/bookTestDataGenerator';
import { Author } from '../../author/entities/author';
import { CategoryTestDataGenerator } from '../../category/testDataGenerators/categoryTestDataGenerator';
import { Category } from '../../category/entities/category';
import { Book } from '../../book/entities/book';

describe('AuthorBookMapper', () => {
  let authorBookMapper: AuthorBookMapper;
  let authorTestDataGenerator: AuthorTestDataGenerator;
  let bookTestDataGenerator: BookTestDataGenerator;
  let categoryTestDataGenerator: CategoryTestDataGenerator;
  let entityManager: EntityManager;

  beforeAll(async () => {
    ConfigLoader.loadConfig();

    const container = await createDIContainer([DbModule, AuthorBookModule, AuthorModule]);

    authorBookMapper = container.resolve('authorBookMapper');
    entityManager = container.resolve('entityManager');

    authorTestDataGenerator = new AuthorTestDataGenerator();
    bookTestDataGenerator = new BookTestDataGenerator();
    categoryTestDataGenerator = new CategoryTestDataGenerator();
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

      const { name } = categoryTestDataGenerator.generateData();

      const createdCategory = entityManager.create(Category, {
        name,
      });

      const savedCategory = await entityManager.save(createdCategory);

      const { title, releaseYear, language, format, price } = bookTestDataGenerator.generateData();

      const createdBook = entityManager.create(Book, {
        title,
        releaseYear,
        language,
        format,
        price,
        categoryId: savedCategory.id,
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
