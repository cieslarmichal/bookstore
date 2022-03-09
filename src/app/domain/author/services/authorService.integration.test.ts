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

describe('AuthorService', () => {
  let authorService: AuthorService;
  let authorRepository: AuthorRepository;
  let authorTestDataGenerator: AuthorTestDataGenerator;

  beforeAll(async () => {
    ConfigLoader.loadConfig();

    const container = await createDIContainer([DbModule, BookModule, AuthorModule]);

    authorService = container.resolve('authorService');
    authorRepository = container.resolve('authorRepository');

    authorTestDataGenerator = new AuthorTestDataGenerator();
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

      const author = await authorService.createAuthor({ firstName, lastName });

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

  describe('Update author', () => {
    it('updates author in database', async () => {
      expect.assertions(2);

      const { firstName, lastName, about } = authorTestDataGenerator.generateData();

      const author = await authorService.createAuthor({ firstName, lastName });

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

      const author = await authorService.createAuthor({ firstName, lastName });

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
