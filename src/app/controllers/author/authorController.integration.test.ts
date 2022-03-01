import { ConfigLoader } from '../../config';
import { AuthorTestDataGenerator } from '../../domain/author/testDataGenerators/authorTestDataGenerator';
import request from 'supertest';
import { App } from '../../../app';
import { createDIContainer } from '../../shared';
import { DbModule } from '../../shared';
import { AuthorModule } from '../../domain/author/authorModule';
import { ControllersModule } from '../controllersModule';
import { BookModule } from '../../domain/book/bookModule';
import { Server } from '../../../server';
import { dbManager } from '../../shared';
import { AuthorRepository } from '../../domain/author/repositories/authorRepository';
import { StatusCodes } from 'http-status-codes';

const baseUrl = '/authors';

describe(`AuthorController (${baseUrl})`, () => {
  let authorRepository: AuthorRepository;
  let authorTestDataGenerator: AuthorTestDataGenerator;
  let server: Server;

  beforeAll(async () => {
    ConfigLoader.loadConfig();

    const container = await createDIContainer([DbModule, BookModule, AuthorModule, ControllersModule]);

    authorRepository = container.resolve('authorRepository');

    authorTestDataGenerator = new AuthorTestDataGenerator();
  });

  beforeEach(async () => {
    const app = new App();

    server = new Server(app.expressApp);

    server.listen();
  });

  afterEach(async () => {
    server.close();

    await dbManager.removeDataFromTables();
  });

  describe('Create author', () => {
    it('returns bad request when not all required properties in body are provided', async () => {
      expect.assertions(1);

      const { firstName } = authorTestDataGenerator.generateData();

      const response = await request(server.server).post(baseUrl).send({
        firstName,
      });

      expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
    });

    it('accepts a request and returns created when all required body properties are provided', async () => {
      expect.assertions(1);

      const { firstName, lastName } = authorTestDataGenerator.generateData();

      const response = await request(server.server).post(baseUrl).send({
        firstName,
        lastName,
      });

      expect(response.statusCode).toBe(StatusCodes.CREATED);
    });
  });

  describe('Find author', () => {
    it('returns bad request the authorId param is not a number', async () => {
      expect.assertions(1);

      const authorId = 'abc';

      const response = await request(server.server).get(`${baseUrl}/${authorId}`);

      expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
    });

    it('returns not found when author with given authorId does not exist', async () => {
      expect.assertions(1);

      const { id } = authorTestDataGenerator.generateData();

      const response = await request(server.server).get(`${baseUrl}/${id}`);

      expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
    });

    it('accepts a request and returns ok when authorId is a number and have corresponding author', async () => {
      expect.assertions(1);

      const { firstName, lastName } = authorTestDataGenerator.generateData();

      const author = await authorRepository.createOne({ firstName, lastName });

      const response = await request(server.server).get(`${baseUrl}/${author.id}`);

      expect(response.statusCode).toBe(StatusCodes.OK);
    });
  });

  describe('Update author', () => {
    it('returns bad request when provided not allowed properties in body', async () => {
      expect.assertions(1);

      const { id, firstName } = authorTestDataGenerator.generateData();

      const response = await request(server.server).patch(`${baseUrl}/${id}`).send({
        firstName,
      });

      expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
    });

    it('returns bad request when the authorId param is not a number', async () => {
      expect.assertions(1);

      const authorId = 'abc';

      const { about } = authorTestDataGenerator.generateData();

      const response = await request(server.server).patch(`${baseUrl}/${authorId}`).send({
        about,
      });

      expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
    });

    it('returns not found when author with given authorId does not exist', async () => {
      expect.assertions(1);

      const { id, about } = authorTestDataGenerator.generateData();

      const response = await request(server.server).patch(`${baseUrl}/${id}`).send({
        about,
      });

      expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
    });

    it('accepts a request and returns ok when authorId is a number and corresponds to existing author', async () => {
      expect.assertions(1);

      const { firstName, lastName } = authorTestDataGenerator.generateData();

      const { about } = authorTestDataGenerator.generateData();

      const author = await authorRepository.createOne({ firstName, lastName });

      const response = await request(server.server).patch(`${baseUrl}/${author.id}`).send({
        about,
      });

      expect(response.statusCode).toBe(StatusCodes.OK);
    });
  });

  describe('Remove author', () => {
    it('returns bad request when the authorId param is not a number', async () => {
      expect.assertions(1);

      const authorId = 'abc';

      const response = await request(server.server).delete(`${baseUrl}/${authorId}`).send();

      expect(response.statusCode).toBe(400);
    });

    it('returns not found when author with given authorId does not exist', async () => {
      expect.assertions(1);

      const { id } = authorTestDataGenerator.generateData();

      const response = await request(server.server).delete(`${baseUrl}/${id}`).send();

      expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
    });

    it('accepts a request and returns ok when authorId is a number and corresponds to existing author', async () => {
      expect.assertions(1);

      const { firstName, lastName } = authorTestDataGenerator.generateData();

      const author = await authorRepository.createOne({ firstName, lastName });

      const response = await request(server.server).delete(`${baseUrl}/${author.id}`);

      expect(response.statusCode).toBe(StatusCodes.OK);
    });
  });
});
