import { EntityManager, getConnection } from 'typeorm';
import { ConfigLoader } from '../../config';
import { BookTestDataGenerator } from '../../domain/book/testDataGenerators/bookTestDataGenerator';
import { PostgresConnectionManager } from '../../shared';
import request from 'supertest';

const baseUrl = '/v1/books';

describe(`BookController (${baseUrl})`, () => {
  let bookTestDataGenerator: BookTestDataGenerator;
  let entityManager: EntityManager;
  let server: Express.Application;

  beforeAll(async () => {
    ConfigLoader.loadConfig();

    await PostgresConnectionManager.connect();

    bookTestDataGenerator = new BookTestDataGenerator();

    entityManager = await getConnection().manager;
  });

  afterAll(async () => {
    await getConnection().close();
  });

  beforeEach(async () => {
    server = require('../../../main');
  });

  afterEach(async () => {
    const entities = getConnection().entityMetadatas;
    for (const entity of entities) {
      const repository = await getConnection().getRepository(entity.name);
      await repository.query(`TRUNCATE ${entity.tableName} RESTART IDENTITY CASCADE;`);
    }
  });

  describe('Create book', () => {
    it('return bad request when not all required properties in body are provided', async () => {
      expect.assertions(1);

      const title = 'Lord of the Rings';

      const response = await request(server).post(baseUrl).send({
        title,
      });

      expect(response.statusCode).toBe(400);
    });

    it('accepts a request and returns created when all required body properties are provided', async () => {
      expect.assertions(1);

      const { title, author, releaseYear, language, format, price } = bookTestDataGenerator.generateData();

      const response = await request(server).post(baseUrl).send({
        title,
        author,
        releaseYear,
        language,
        format,
        price,
      });

      expect(response.statusCode).toBe(201);
    });
  });

  describe('Find book', () => {
    it('return bad request the bookId param is not a number', async () => {
      expect.assertions(1);

      const bookId = 'abc';

      const response = await request(server).get(`${baseUrl}/${bookId}`);

      expect(response.statusCode).toBe(400);
    });

    it('return not found when book with given id does not exist', async () => {
      expect.assertions(1);

      const bookId = '777';

      const response = await request(server).get(`${baseUrl}/${bookId}`);

      expect(response.statusCode).toBe(404);
    });

    it('accepts a request when the resourceId param and userId query are uuid', async () => {
      expect.assertions(1);

      const userId = 'e46c11a8-8893-412d-bc8b-60753a98e45c';
      const resourceId = 'e46c11a8-8893-412d-bc8b-60753a98e45c';

      const response = await httpHelper.request({
        method: HttpMethod.GET,
        url: `${baseUrl}/${resourceId}?${userIdField}=${userId}`,
        token: authToken,
      });

      expect(response.statusCode).toBe(HttpStatus.OK);
    });
  });

  describe('Update user resource', () => {
    it('throws an error when the resourceId param is not a uuid', async () => {
      expect.assertions(1);

      const userId = 'e46c11a8-8893-412d-bc8b-60753a98e45c';
      const resourceId = '123';
      const body = { title: 'title', thumbnailUrl: 'thumbnailUrl', content: 'content' };

      const response = await httpHelper.request({
        method: HttpMethod.PUT,
        url: `${baseUrl}/${resourceId}?${userIdField}=${userId}`,
        token: authToken,
        data: body,
      });

      expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    it('throws an error when the userId query is not a uuid', async () => {
      expect.assertions(1);

      const userId = '123';
      const resourceId = 'e46c11a8-8893-412d-bc8b-60753a98e45c';
      const body = { title: 'title', thumbnailUrl: 'thumbnailUrl', content: 'content' };

      const response = await httpHelper.request({
        method: HttpMethod.PUT,
        url: `${baseUrl}/${resourceId}?${userIdField}=${userId}`,
        token: authToken,
        data: body,
      });

      expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    it('throws when any of body fields is not string', async () => {
      expect.assertions(1);

      const userId = 'e46c11a8-8893-412d-bc8b-60753a98e45c';
      const resourceId = 'e46c11a8-8893-412d-bc8b-60753a98e45c';
      const body = { title: 'title', thumbnailUrl: 'thumbnailUrl', content: true };

      const response = await httpHelper.request({
        method: HttpMethod.PUT,
        url: `${baseUrl}/${resourceId}?${userIdField}=${userId}`,
        token: authToken,
        data: body,
      });

      expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    it('accepts a request when the resourceId param and userId query are uuid', async () => {
      expect.assertions(1);

      const userId = 'e46c11a8-8893-412d-bc8b-60753a98e45c';
      const resourceId = 'e46c11a8-8893-412d-bc8b-60753a98e45c';
      const body = { title: 'title', thumbnailUrl: 'thumbnailUrl', content: 'content' };

      const response = await httpHelper.request({
        method: HttpMethod.PUT,
        url: `${baseUrl}/${resourceId}?${userIdField}=${userId}`,
        token: authToken,
        data: body,
      });

      expect(response.statusCode).toBe(HttpStatus.OK);
    });
  });

  describe('Remove user resource', () => {
    it('throws an error when the resourceId param is not a uuid', async () => {
      expect.assertions(1);

      const userId = 'e46c11a8-8893-412d-bc8b-60753a98e45c';
      const resourceId = '123';

      const response = await httpHelper.request({
        method: HttpMethod.DELETE,
        url: `${baseUrl}/${resourceId}?${userIdField}=${userId}`,
        token: authToken,
      });

      expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    it('throws an error when the userId query is not a uuid', async () => {
      expect.assertions(1);

      const userId = '123';
      const resourceId = 'e46c11a8-8893-412d-bc8b-60753a98e45c';

      const response = await httpHelper.request({
        method: HttpMethod.DELETE,
        url: `${baseUrl}/${resourceId}?${userIdField}=${userId}`,
        token: authToken,
      });

      expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    it('accepts a request when the resourceId param and userId query are uuid', async () => {
      expect.assertions(1);

      const userId = 'e46c11a8-8893-412d-bc8b-60753a98e45c';
      const resourceId = 'e46c11a8-8893-412d-bc8b-60753a98e45c';

      const response = await httpHelper.request({
        method: HttpMethod.DELETE,
        url: `${baseUrl}/${resourceId}?${userIdField}=${userId}`,
        token: authToken,
      });

      expect(response.statusCode).toBe(HttpStatus.NO_CONTENT);
    });
  });
});
