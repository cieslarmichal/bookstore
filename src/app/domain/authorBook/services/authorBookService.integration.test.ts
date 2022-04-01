import { AuthorBookRepository } from '../repositories/authorBookRepository';
import { AuthorBookService } from './authorBookService';
import { AuthorBookTestDataGenerator } from '../testDataGenerators/authorBookTestDataGenerator';
import { ConfigLoader } from '../../../../configLoader';
import { createDIContainer, UnitOfWorkModule } from '../../../shared';
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
import { LoggerModule } from '../../../shared/logger/loggerModule';
import { AUTHOR_BOOK_REPOSITORY_FACTORY, AUTHOR_BOOK_SERVICE } from '../authorBookInjectionSymbols';
import { AUTHOR_REPOSITORY_FACTORY } from '../../author/authorInjectionSymbols';
import { BOOK_REPOSITORY_FACTORY } from '../../book/bookInjectionSymbols';

describe('AuthorBookService', () => {
  let authorBookService: AuthorBookService;
  let authorBookRepository: AuthorBookRepository;
  let authorRepository: AuthorRepository;
  let bookRepository: BookRepository;
  let authorBookTestDataGenerator: AuthorBookTestDataGenerator;
  let authorTestDataGenerator: AuthorTestDataGenerator;
  let bookTestDataGenerator: BookTestDataGenerator;
  let postgresHelper: PostgresHelper;

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

    const entityManager = container.resolve(ENTITY_MANAGER);
    authorBookService = container.resolve(AUTHOR_BOOK_SERVICE);
    authorBookRepository = container.resolve(AUTHOR_BOOK_REPOSITORY_FACTORY).create(entityManager);
    authorRepository = container.resolve(AUTHOR_REPOSITORY_FACTORY).create(entityManager);
    bookRepository = container.resolve(BOOK_REPOSITORY_FACTORY).create(entityManager);

    postgresHelper = new PostgresHelper(container);

    authorBookTestDataGenerator = new AuthorBookTestDataGenerator();
    authorTestDataGenerator = new AuthorTestDataGenerator();
    bookTestDataGenerator = new BookTestDataGenerator();
  });

  afterEach(async () => {
    await PostgresHelper.removeDataFromTables();
  });

  describe('Create authorBook', () => {
    it('creates authorBook in database', async () => {
      expect.assertions(1);

      await postgresHelper.runInTestTransaction(async (unitOfWork) => {
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

      await postgresHelper.runInTestTransaction(async (unitOfWork) => {
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

      await postgresHelper.runInTestTransaction(async (unitOfWork) => {
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

      await postgresHelper.runInTestTransaction(async (unitOfWork) => {
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
