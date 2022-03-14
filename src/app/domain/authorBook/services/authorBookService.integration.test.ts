import { AuthorBookRepository } from '../repositories/authorBookRepository';
import { AuthorBookService } from './authorBookService';
import { AuthorBookTestDataGenerator } from '../testDataGenerators/authorBookTestDataGenerator';
import { ConfigLoader } from '../../../../configLoader';
import { createDIContainer } from '../../../shared';
import { DbModule } from '../../../shared';
import { AuthorBookModule } from '../authorBookModule';
import { AuthorModule } from '../../author/authorModule';
import { AuthorBookAlreadyExists, AuthorBookNotFound } from '../errors';
import { PostgresHelper } from '../../../../integration/helpers/postgresHelper/postgresHelper';
import { BookModule } from '../../book/bookModule';
import { CategoryModule } from '../../category/categoryModule';
import { AuthorRepository } from '../../author/repositories/authorRepository';
import { BookRepository } from '../../book/repositories/bookRepository';
import { AuthorTestDataGenerator } from '../../author/testDataGenerators/authorTestDataGenerator';
import { BookTestDataGenerator } from '../../book/testDataGenerators/bookTestDataGenerator';
import { CategoryRepository } from '../../category/repositories/categoryRepository';
import { CategoryTestDataGenerator } from '../../category/testDataGenerators/categoryTestDataGenerator';
import { LoggerModule } from '../../../shared/logger/loggerModule';

describe('AuthorBookService', () => {
  let authorBookService: AuthorBookService;
  let authorBookRepository: AuthorBookRepository;
  let authorRepository: AuthorRepository;
  let bookRepository: BookRepository;
  let categoryRepository: CategoryRepository;
  let authorBookTestDataGenerator: AuthorBookTestDataGenerator;
  let authorTestDataGenerator: AuthorTestDataGenerator;
  let bookTestDataGenerator: BookTestDataGenerator;
  let categoryTestDataGenerator: CategoryTestDataGenerator;

  beforeAll(async () => {
    ConfigLoader.loadConfig();

    const container = await createDIContainer([
      DbModule,
      CategoryModule,
      BookModule,
      AuthorModule,
      AuthorBookModule,
      LoggerModule,
    ]);

    authorBookService = container.resolve('authorBookService');
    authorBookRepository = container.resolve('authorBookRepository');
    authorRepository = container.resolve('authorRepository');
    bookRepository = container.resolve('bookRepository');
    categoryRepository = container.resolve('categoryRepository');

    authorBookTestDataGenerator = new AuthorBookTestDataGenerator();
    authorTestDataGenerator = new AuthorTestDataGenerator();
    bookTestDataGenerator = new BookTestDataGenerator();
    categoryTestDataGenerator = new CategoryTestDataGenerator();
  });

  afterEach(async () => {
    await PostgresHelper.removeDataFromTables();
  });

  describe('Create authorBook', () => {
    it('creates authorBook in database', async () => {
      expect.assertions(1);

      const { firstName, lastName } = authorTestDataGenerator.generateData();

      const author = await authorRepository.createOne({
        firstName,
        lastName,
      });

      const { name } = categoryTestDataGenerator.generateData();

      const category = await categoryRepository.createOne({
        name,
      });

      const { title, releaseYear, language, format, price } = bookTestDataGenerator.generateData();

      const book = await bookRepository.createOne({
        title,
        releaseYear,
        language,
        format,
        price,
        categoryId: category.id,
      });

      const createdAuthorBookDto = await authorBookService.createAuthorBook({
        authorId: author.id,
        bookId: book.id,
      });

      const authorBookDto = await authorBookRepository.findOneById(createdAuthorBookDto.id);

      expect(authorBookDto).not.toBeNull();
    });

    it('should not create authorBook and throw if authorBook with the same name exists', async () => {
      expect.assertions(1);

      const { firstName, lastName } = authorTestDataGenerator.generateData();

      const author = await authorRepository.createOne({
        firstName,
        lastName,
      });

      const { name } = categoryTestDataGenerator.generateData();

      const category = await categoryRepository.createOne({
        name,
      });

      const { title, releaseYear, language, format, price } = bookTestDataGenerator.generateData();

      const book = await bookRepository.createOne({
        title,
        releaseYear,
        language,
        format,
        price,
        categoryId: category.id,
      });

      await authorBookService.createAuthorBook({
        authorId: author.id,
        bookId: book.id,
      });

      try {
        await authorBookService.createAuthorBook({
          authorId: author.id,
          bookId: book.id,
        });
      } catch (error) {
        expect(error).toBeInstanceOf(AuthorBookAlreadyExists);
      }
    });
  });

  describe('Remove authorBook', () => {
    it('removes authorBook from database', async () => {
      expect.assertions(1);

      const { firstName, lastName } = authorTestDataGenerator.generateData();

      const author = await authorRepository.createOne({
        firstName,
        lastName,
      });

      const { name } = categoryTestDataGenerator.generateData();

      const category = await categoryRepository.createOne({
        name,
      });

      const { title, releaseYear, language, format, price } = bookTestDataGenerator.generateData();

      const book = await bookRepository.createOne({
        title,
        releaseYear,
        language,
        format,
        price,
        categoryId: category.id,
      });

      const authorBook = await authorBookRepository.createOne({
        authorId: author.id,
        bookId: book.id,
      });

      await authorBookService.removeAuthorBook({ authorId: author.id, bookId: book.id });

      const authorBookDto = await authorBookRepository.findOneById(authorBook.id);

      expect(authorBookDto).toBeNull();
    });

    it('should throw if authorBook with given id does not exist', async () => {
      expect.assertions(1);

      const { authorId, bookId } = authorBookTestDataGenerator.generateData();

      try {
        await authorBookService.removeAuthorBook({ authorId, bookId });
      } catch (error) {
        expect(error).toBeInstanceOf(AuthorBookNotFound);
      }
    });
  });
});
