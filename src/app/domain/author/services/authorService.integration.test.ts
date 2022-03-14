import { AuthorRepository } from '../repositories/authorRepository';
import { ConfigLoader } from '../../../../configLoader';
import { createDIContainer } from '../../../shared';
import { DbModule } from '../../../shared';
import { AuthorTestDataGenerator } from '../testDataGenerators/authorTestDataGenerator';
import { AuthorService } from './authorService';
import { AuthorModule } from '../authorModule';
import { BookModule } from '../../book/bookModule';
import { AuthorNotFound } from '../errors';
import { PostgresHelper } from '../../../../integration/helpers/postgresHelper/postgresHelper';
import { BookRepository } from '../../book/repositories/bookRepository';
import { AuthorBookModule } from '../../authorBook/authorBookModule';
import { AuthorBookRepository } from '../../authorBook/repositories/authorBookRepository';
import { BookTestDataGenerator } from '../../book/testDataGenerators/bookTestDataGenerator';
import { LoggerModule } from '../../../shared/logger/loggerModule';
import { AUTHOR_REPOSITORY, AUTHOR_SERVICE } from '../authorInjectionSymbols';
import { BOOK_REPOSITORY } from '../../book/bookInjectionSymbols';
import { AUTHOR_BOOK_REPOSITORY } from '../../authorBook/authorBookInjectionSymbols';

describe('AuthorService', () => {
  let authorService: AuthorService;
  let authorRepository: AuthorRepository;
  let bookRepository: BookRepository;
  let authorBookRepository: AuthorBookRepository;
  let authorTestDataGenerator: AuthorTestDataGenerator;
  let bookTestDataGenerator: BookTestDataGenerator;

  beforeAll(async () => {
    ConfigLoader.loadConfig();

    const container = await createDIContainer([DbModule, BookModule, AuthorModule, AuthorBookModule, LoggerModule]);

    authorService = container.resolve(AUTHOR_SERVICE);
    authorRepository = container.resolve(AUTHOR_REPOSITORY);
    bookRepository = container.resolve(BOOK_REPOSITORY);
    authorBookRepository = container.resolve(AUTHOR_BOOK_REPOSITORY);

    authorTestDataGenerator = new AuthorTestDataGenerator();
    bookTestDataGenerator = new BookTestDataGenerator();
  });

  afterEach(async () => {
    await PostgresHelper.removeDataFromTables();
  });

  describe('Create author', () => {
    it('creates author in database', async () => {
      expect.assertions(1);

      const { firstName, lastName } = authorTestDataGenerator.generateData();

      const createdAuthorDto = await authorService.createAuthor({ firstName, lastName });

      const authorDto = await authorRepository.findOneById(createdAuthorDto.id);

      expect(authorDto).not.toBeNull();
    });
  });

  describe('Find author', () => {
    it('finds author by id in database', async () => {
      expect.assertions(1);

      const { firstName, lastName } = authorTestDataGenerator.generateData();

      const author = await authorRepository.createOne({ firstName, lastName });

      const foundAuthor = await authorService.findAuthor(author.id);

      expect(foundAuthor).not.toBeNull();
    });

    it('should throw if author with given id does not exist in db', async () => {
      expect.assertions(1);

      const { id } = authorTestDataGenerator.generateData();

      try {
        await authorService.findAuthor(id);
      } catch (error) {
        expect(error).toBeInstanceOf(AuthorNotFound);
      }
    });
  });

  describe('Find authors', () => {
    it('finds authors in database', async () => {
      expect.assertions(2);

      const { firstName, lastName } = authorTestDataGenerator.generateData();

      const author = await authorRepository.createOne({ firstName, lastName });

      const foundAuthors = await authorService.findAuthors();

      expect(foundAuthors.length).toBe(1);
      expect(foundAuthors[0]).toStrictEqual(author);
    });

    it('should throw if author with given id does not exist in db', async () => {
      expect.assertions(1);

      const { id } = authorTestDataGenerator.generateData();

      try {
        await authorService.findAuthor(id);
      } catch (error) {
        expect(error).toBeInstanceOf(AuthorNotFound);
      }
    });
  });

  describe('Find authors by book id', () => {
    it('finds authors by book id in database', async () => {
      expect.assertions(6);

      const { title, releaseYear, language, format, price, categoryId } = bookTestDataGenerator.generateData();

      const book = await bookRepository.createOne({
        title,
        releaseYear,
        language,
        format,
        price,
        categoryId,
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

      const foundAuthors = await authorService.findAuthorsByBookId(book.id);

      expect(foundAuthors).not.toBeNull();
      expect(foundAuthors.length).toBe(2);
      expect(foundAuthors[0].firstName).toBe(firstAuthor.firstName);
      expect(foundAuthors[0].lastName).toBe(firstAuthor.lastName);
      expect(foundAuthors[1].firstName).toBe(secondAuthor.firstName);
      expect(foundAuthors[1].lastName).toBe(secondAuthor.lastName);
    });
  });

  describe('Update author', () => {
    it('updates author in database', async () => {
      expect.assertions(2);

      const { firstName, lastName, about } = authorTestDataGenerator.generateData();

      const author = await authorRepository.createOne({ firstName, lastName });

      const updatedAuthor = await authorService.updateAuthor(author.id, { about });

      expect(updatedAuthor).not.toBeNull();
      expect(updatedAuthor.about).toBe(about);
    });

    it('should not update author and throw if author with given id does not exist', async () => {
      expect.assertions(1);

      const { id, about } = authorTestDataGenerator.generateData();

      try {
        await authorService.updateAuthor(id, { about });
      } catch (error) {
        expect(error).toBeInstanceOf(AuthorNotFound);
      }
    });
  });

  describe('Remove author', () => {
    it('removes author from database', async () => {
      expect.assertions(1);

      const { firstName, lastName } = authorTestDataGenerator.generateData();

      const author = await authorRepository.createOne({ firstName, lastName });

      await authorService.removeAuthor(author.id);

      const authorDto = await authorRepository.findOneById(author.id);

      expect(authorDto).toBeNull();
    });

    it('should throw if author with given id does not exist', async () => {
      expect.assertions(1);

      const { id } = authorTestDataGenerator.generateData();

      try {
        await authorService.removeAuthor(id);
      } catch (error) {
        expect(error).toBeInstanceOf(AuthorNotFound);
      }
    });
  });
});
