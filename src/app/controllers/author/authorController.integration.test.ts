import { getConnection } from 'typeorm';
import { ConfigLoader } from '../../config';
import { AuthorTestDataGenerator } from '../../domain/author/testDataGenerators/authorTestDataGenerator';
import request from 'supertest';
import { AuthorService } from '../../domain/author/services/authorService';
import { App } from '../../../app';
import { createDIContainer } from '../../shared';
import { DbModule } from '../../shared';
import { AuthorModule } from '../../domain/author/authorModule';
import { ControllersModule } from '../controllersModule';
import { BookModule } from '../../domain/book/bookModule';

const baseUrl = '/authors';

describe(`AuthorController (${baseUrl})`, () => {
  let authorService: AuthorService;
  let authorTestDataGenerator: AuthorTestDataGenerator;
  let app: App;

  beforeAll(async () => {
    ConfigLoader.loadConfig();

    const container = await createDIContainer([DbModule, BookModule, AuthorModule, ControllersModule]);

    authorService = container.resolve('authorService');

    authorTestDataGenerator = new AuthorTestDataGenerator();
  });

  beforeEach(async () => {
    app = new App();
    app.run();
  });

  afterEach(async () => {
    app.stop();

    const entities = getConnection().entityMetadatas;
    for (const entity of entities) {
      const repository = getConnection().getRepository(entity.name);
      await repository.query(`TRUNCATE ${entity.tableName} RESTART IDENTITY CASCADE;`);
    }
  });

  describe('Create author', () => {
    it('return bad request when not all required properties in body are provided', async () => {
      expect.assertions(1);

      const { firstName } = authorTestDataGenerator.generateData();

      const response = await request(app.server).post(baseUrl).send({
        firstName,
      });

      expect(response.statusCode).toBe(400);
    });

    it('accepts a request and returns created when all required body properties are provided', async () => {
      expect.assertions(1);

      const { firstName, lastName } = authorTestDataGenerator.generateData();

      const response = await request(app.server).post(baseUrl).send({
        firstName,
        lastName,
      });

      expect(response.statusCode).toBe(201);
    });
  });

  describe('Find author', () => {
    it('return bad request the authorId param is not a number', async () => {
      expect.assertions(1);

      const authorId = 'abc';

      const response = await request(app.server).get(`${baseUrl}/${authorId}`);

      expect(response.statusCode).toBe(400);
    });

    it('return not found when author with given authorId does not exist', async () => {
      expect.assertions(1);

      const { id } = authorTestDataGenerator.generateData();

      const response = await request(app.server).get(`${baseUrl}/${id}`);

      expect(response.statusCode).toBe(404);
    });

    it('accepts a request and returns ok when authorId is a number and have corresponding author', async () => {
      expect.assertions(1);

      const { firstName, lastName } = authorTestDataGenerator.generateData();

      const author = await authorService.createAuthor({ firstName, lastName });

      const response = await request(app.server).get(`${baseUrl}/${author.id}`);

      expect(response.statusCode).toBe(200);
    });
  });

  describe('Update author', () => {
    it('returns bad request when provided not allowed properties in body', async () => {
      expect.assertions(1);

      const { id, firstName } = authorTestDataGenerator.generateData();

      const response = await request(app.server).patch(`${baseUrl}/${id}`).send({
        firstName,
      });

      expect(response.statusCode).toBe(400);
    });

    it('returns bad request when the authorId param is not a number', async () => {
      expect.assertions(1);

      const authorId = 'abc';

      const { about } = authorTestDataGenerator.generateData();

      const response = await request(app.server).patch(`${baseUrl}/${authorId}`).send({
        about,
      });

      expect(response.statusCode).toBe(400);
    });

    it('return not found when author with given authorId does not exist', async () => {
      expect.assertions(1);

      const { id, about } = authorTestDataGenerator.generateData();

      const response = await request(app.server).patch(`${baseUrl}/${id}`).send({
        about,
      });

      expect(response.statusCode).toBe(404);
    });

    it('accepts a request and returns ok when authorId is a number and corresponds to existing author', async () => {
      expect.assertions(1);

      const { firstName, lastName } = authorTestDataGenerator.generateData();

      const { about } = authorTestDataGenerator.generateData();

      const author = await authorService.createAuthor({ firstName, lastName });

      const response = await request(app.server).patch(`${baseUrl}/${author.id}`).send({
        about,
      });

      expect(response.statusCode).toBe(200);
    });
  });

  describe('Remove author', () => {
    it('returns bad request when the authorId param is not a number', async () => {
      expect.assertions(1);

      const authorId = 'abc';

      const response = await request(app.server).delete(`${baseUrl}/${authorId}`).send();

      expect(response.statusCode).toBe(400);
    });

    it('return not found when author with given authorId does not exist', async () => {
      expect.assertions(1);

      const { id } = authorTestDataGenerator.generateData();

      const response = await request(app.server).delete(`${baseUrl}/${id}`).send();

      expect(response.statusCode).toBe(404);
    });

    it('accepts a request and returns ok when authorId is a number and corresponds to existing author', async () => {
      expect.assertions(1);

      const { firstName, lastName } = authorTestDataGenerator.generateData();

      const author = await authorService.createAuthor({ firstName, lastName });

      const response = await request(app.server).delete(`${baseUrl}/${author.id}`);

      expect(response.statusCode).toBe(200);
    });
  });
});
