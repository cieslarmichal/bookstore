import { AuthorRepository } from '../repositories/authorRepository';
import { ConfigLoader } from '../../../config';
import { createDIContainer, dbManager } from '../../../shared';
import { DbModule } from '../../../shared';
import { ControllersModule } from '../../../controllers/controllersModule';
import { AuthorTestDataGenerator } from '../testDataGenerators/authorTestDataGenerator';
import { AuthorService } from './authorService';
import { AuthorModule } from '../authorModule';
import { BookModule } from '../../book/bookModule';

describe('AuthorService', () => {
  let authorService: AuthorService;
  let authorRepository: AuthorRepository;
  let authorTestDataGenerator: AuthorTestDataGenerator;

  beforeAll(async () => {
    ConfigLoader.loadConfig();

    const container = await createDIContainer([DbModule, BookModule, AuthorModule, ControllersModule]);

    authorService = container.resolve('authorService');
    authorRepository = container.resolve('authorRepository');

    authorTestDataGenerator = new AuthorTestDataGenerator();
  });

  afterEach(async () => {
    await dbManager.removeDataFromTables();
  });

  describe('Create author', () => {
    it('creates author in database', async () => {
      expect.assertions(1);

      const { firstName, lastName } = authorTestDataGenerator.generateData();

      const createdAuthorDto = await authorService.createAuthor({ firstName, lastName });

      const authorDto = await authorRepository.findOneById(createdAuthorDto.id);

      expect(authorDto).not.toBeNull();
    });

    it('should not create author and throw if author with the same title and author already exists', async () => {
      expect.assertions(1);

      const { firstName, lastName } = authorTestDataGenerator.generateData();

      await authorService.createAuthor({ firstName, lastName });

      try {
        await authorService.createAuthor({ firstName, lastName });
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
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
        expect(error).toBeInstanceOf(Error);
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
        expect(error).toBeInstanceOf(Error);
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
        expect(error).toBeInstanceOf(Error);
      }
    });
  });
});
