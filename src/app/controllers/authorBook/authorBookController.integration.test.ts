import { ConfigLoader } from '../../../configLoader';
import { AuthorTestDataGenerator } from '../../domain/author/testDataGenerators/authorTestDataGenerator';
import request from 'supertest';
import { App } from '../../../app';
import { createDIContainer, dbManager, UnitOfWorkModule } from '../../shared';
import { DbModule } from '../../shared';
import { AuthorModule } from '../../domain/author/authorModule';
import { ControllersModule } from '../controllersModule';
import { BookModule } from '../../domain/book/bookModule';
import { Server } from '../../../server';
import { AuthorBookRepository } from '../../domain/authorBook/repositories/authorBookRepository';
import { UserTestDataGenerator } from '../../domain/user/testDataGenerators/userTestDataGenerator';
import { StatusCodes } from 'http-status-codes';
import { AuthHelper } from '../../../integration/helpers';
import { UserModule } from '../../domain/user/userModule';
import { CategoryModule } from '../../domain/category/categoryModule';
import { AuthorBookModule } from '../../domain/authorBook/authorBookModule';
import { AuthorRepository } from '../../domain/author/repositories/authorRepository';
import { BookRepository } from '../../domain/book/repositories/bookRepository';
import { BookTestDataGenerator } from '../../domain/book/testDataGenerators/bookTestDataGenerator';
import { AuthorBookTestDataGenerator } from '../../domain/authorBook/testDataGenerators/authorBookTestDataGenerator';
import { LoggerModule } from '../../shared/logger/loggerModule';
import { AUTHOR_REPOSITORY_FACTORY } from '../../domain/author/authorInjectionSymbols';
import { BOOK_REPOSITORY_FACTORY } from '../../domain/book/bookInjectionSymbols';
import { AUTHOR_BOOK_REPOSITORY_FACTORY } from '../../domain/authorBook/authorBookInjectionSymbols';
import { BookCategoryModule } from '../../domain/bookCategory/bookCategoryModule';
import { AddressModule } from '../../domain/address/addressModule';
import { CustomerModule } from '../../domain/customer/customerModule';
import { ENTITY_MANAGER } from '../../shared/db/dbInjectionSymbols';

const authorsUrl = '/authors';
const booksUrl = '/books';

describe(`AuthorBookController`, () => {
  let authorBookRepository: AuthorBookRepository;
  let authorRepository: AuthorRepository;
  let bookRepository: BookRepository;
  let authorBookTestDataGenerator: AuthorBookTestDataGenerator;
  let authorTestDataGenerator: AuthorTestDataGenerator;
  let bookTestDataGenerator: BookTestDataGenerator;
  let userTestDataGenerator: UserTestDataGenerator;
  let server: Server;
  let authHelper: AuthHelper;

  beforeAll(async () => {
    ConfigLoader.loadConfig();

    authorBookTestDataGenerator = new AuthorBookTestDataGenerator();
    userTestDataGenerator = new UserTestDataGenerator();
    authorTestDataGenerator = new AuthorTestDataGenerator();
    bookTestDataGenerator = new BookTestDataGenerator();
  });

  beforeEach(async () => {
    const container = await createDIContainer([
      DbModule,
      CategoryModule,
      BookModule,
      AuthorModule,
      AuthorBookModule,
      UserModule,
      ControllersModule,
      LoggerModule,
      BookCategoryModule,
      AddressModule,
      CustomerModule,
      UnitOfWorkModule,
    ]);

    const entityManager = container.resolve(ENTITY_MANAGER);
    authorRepository = container.resolve(AUTHOR_REPOSITORY_FACTORY).create(entityManager);
    bookRepository = container.resolve(BOOK_REPOSITORY_FACTORY).create(entityManager);
    authorBookRepository = container.resolve(AUTHOR_BOOK_REPOSITORY_FACTORY).create(entityManager);

    authHelper = new AuthHelper(container);

    const app = new App(container);

    server = new Server(app.instance);

    server.listen();
  });

  afterEach(async () => {
    server.close();

    dbManager.closeConnection();
  });

  describe('Create authorBook', () => {
    it('returns bad request when authorId or bookId are not uuid', async () => {
      expect.assertions(1);

      const { id: userId, role } = userTestDataGenerator.generateData();

      const accessToken = authHelper.mockAuth({ userId, role });

      const authorId = '123';
      const bookId = '123';

      const response = await request(server.instance)
        .post(`${authorsUrl}/${authorId}/books/${bookId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
    });

    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      const { authorId, bookId } = authorBookTestDataGenerator.generateData();

      const response = await request(server.instance).post(`${authorsUrl}/${authorId}/books/${bookId}`);

      expect(response.statusCode).toBe(StatusCodes.UNAUTHORIZED);
    });

    it('returns unprocessable entity when authorBook with authorId and bookId already exists', async () => {
      expect.assertions(1);

      const { id: userId, role } = userTestDataGenerator.generateData();

      const accessToken = authHelper.mockAuth({ userId, role });

      const { title, releaseYear, language, format, price } = bookTestDataGenerator.generateData();

      const book = await bookRepository.createOne({
        title,
        releaseYear,
        language,
        format,
        price,
      });

      const { firstName, lastName } = authorTestDataGenerator.generateData();

      const author = await authorRepository.createOne({ firstName, lastName });

      await authorBookRepository.createOne({ authorId: author.id, bookId: book.id });

      const response = await request(server.instance)
        .post(`${authorsUrl}/${author.id}/books/${book.id}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.statusCode).toBe(StatusCodes.UNPROCESSABLE_ENTITY);
    });

    it('returns not found when author or book corresponding to authorId and bookId does not exist', async () => {
      expect.assertions(1);

      const { id: userId, role } = userTestDataGenerator.generateData();

      const accessToken = authHelper.mockAuth({ userId, role });

      const { authorId, bookId } = authorBookTestDataGenerator.generateData();

      const response = await request(server.instance)
        .post(`${authorsUrl}/${authorId}/books/${bookId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
    });

    it('returns created when all required params are provided', async () => {
      expect.assertions(1);

      const { id: userId, role } = userTestDataGenerator.generateData();

      const accessToken = authHelper.mockAuth({ userId, role });

      const { title, releaseYear, language, format, price } = bookTestDataGenerator.generateData();

      const book = await bookRepository.createOne({
        title,
        releaseYear,
        language,
        format,
        price,
      });

      const { firstName, lastName } = authorTestDataGenerator.generateData();

      const author = await authorRepository.createOne({ firstName, lastName });

      const response = await request(server.instance)
        .post(`${authorsUrl}/${author.id}/books/${book.id}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.statusCode).toBe(StatusCodes.CREATED);
    });
  });

  describe('Find author books', () => {
    it('returns bad request the authorId param is not uuid', async () => {
      expect.assertions(1);

      const { id: userId, role } = userTestDataGenerator.generateData();

      const accessToken = authHelper.mockAuth({ userId, role });

      const authorId = 'abc';

      const response = await request(server.instance)
        .get(`${authorsUrl}/${authorId}/books`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
    });

    it('returns not found when author with given authorId does not exist', async () => {
      expect.assertions(1);

      const { id: userId, role } = userTestDataGenerator.generateData();

      const accessToken = authHelper.mockAuth({ userId, role });

      const { id } = authorTestDataGenerator.generateData();

      const response = await request(server.instance)
        .get(`${authorsUrl}/${id}/books`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
    });

    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      const { firstName, lastName } = authorTestDataGenerator.generateData();

      const author = await authorRepository.createOne({ firstName, lastName });

      const response = await request(server.instance).get(`${authorsUrl}/${author.id}/books`);

      expect(response.statusCode).toBe(StatusCodes.UNAUTHORIZED);
    });

    it('returns ok when authorId is uuid and have corresponding author', async () => {
      expect.assertions(1);

      const { id: userId, role } = userTestDataGenerator.generateData();

      const accessToken = authHelper.mockAuth({ userId, role });

      const { firstName, lastName } = authorTestDataGenerator.generateData();

      const author = await authorRepository.createOne({ firstName, lastName });

      const response = await request(server.instance)
        .get(`${authorsUrl}/${author.id}/books`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.statusCode).toBe(StatusCodes.OK);
    });

    it('returns books matching filter criteria', async () => {
      expect.assertions(2);

      const { id: userId, role } = userTestDataGenerator.generateData();

      const accessToken = authHelper.mockAuth({ userId, role });

      const { title, releaseYear, language, format, price } = bookTestDataGenerator.generateData();

      const book1 = await bookRepository.createOne({
        title,
        releaseYear,
        language,
        format,
        price,
      });

      const { title: otherTitle } = bookTestDataGenerator.generateData();

      const book2 = await bookRepository.createOne({
        title: otherTitle,
        releaseYear,
        language,
        format,
        price,
      });

      const { firstName, lastName } = authorTestDataGenerator.generateData();

      const author = await authorRepository.createOne({ firstName, lastName });

      await authorBookRepository.createOne({ authorId: author.id, bookId: book1.id });
      await authorBookRepository.createOne({ authorId: author.id, bookId: book2.id });

      const response = await request(server.instance)
        .get(`${authorsUrl}/${author.id}/books?filter=["title||like||${title}"]`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.statusCode).toBe(StatusCodes.OK);
      expect(response.body.data.books.length).toBe(1);
    });
  });

  describe('Find authors of the book', () => {
    it('returns bad request the bookId param is not uuid', async () => {
      expect.assertions(1);

      const { id: userId, role } = userTestDataGenerator.generateData();

      const accessToken = authHelper.mockAuth({ userId, role });

      const bookId = 'abc';

      const response = await request(server.instance)
        .get(`${booksUrl}/${bookId}/authors`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
    });

    it('returns not found when book with given bookId does not exist', async () => {
      expect.assertions(1);

      const { id: userId, role } = userTestDataGenerator.generateData();

      const accessToken = authHelper.mockAuth({ userId, role });

      const { id } = bookTestDataGenerator.generateData();

      const response = await request(server.instance)
        .get(`${booksUrl}/${id}/authors`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
    });

    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      const { title, releaseYear, language, format, price } = bookTestDataGenerator.generateData();

      const book = await bookRepository.createOne({
        title,
        releaseYear,
        language,
        format,
        price,
      });

      const response = await request(server.instance).get(`${booksUrl}/${book.id}/authors`);

      expect(response.statusCode).toBe(StatusCodes.UNAUTHORIZED);
    });

    it('returns ok when bookId is uuid and have corresponding book', async () => {
      expect.assertions(1);

      const { id: userId, role } = userTestDataGenerator.generateData();

      const accessToken = authHelper.mockAuth({ userId, role });

      const { title, releaseYear, language, format, price } = bookTestDataGenerator.generateData();

      const book = await bookRepository.createOne({
        title,
        releaseYear,
        language,
        format,
        price,
      });

      const response = await request(server.instance)
        .get(`${booksUrl}/${book.id}/authors`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.statusCode).toBe(StatusCodes.OK);
    });

    it('returns authors matching filter criteria', async () => {
      expect.assertions(2);

      const { id: userId, role } = userTestDataGenerator.generateData();

      const accessToken = authHelper.mockAuth({ userId, role });

      const { title, releaseYear, language, format, price } = bookTestDataGenerator.generateData();

      const book = await bookRepository.createOne({
        title,
        releaseYear,
        language,
        format,
        price,
      });

      const { firstName, lastName } = authorTestDataGenerator.generateData();

      const author1 = await authorRepository.createOne({ firstName, lastName });

      const { firstName: otherFirstName } = authorTestDataGenerator.generateData();

      const author2 = await authorRepository.createOne({ firstName: otherFirstName, lastName });

      await authorBookRepository.createOne({ authorId: author1.id, bookId: book.id });
      await authorBookRepository.createOne({ authorId: author2.id, bookId: book.id });

      const response = await request(server.instance)
        .get(`${booksUrl}/${book.id}/authors?filter=["firstName||like||${firstName}"]`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.statusCode).toBe(StatusCodes.OK);
      expect(response.body.data.authors.length).toBe(1);
    });
  });

  describe('Remove authorBook', () => {
    it('returns bad request when authorId or bookId params are not uuid', async () => {
      expect.assertions(1);

      const { id: userId, role } = userTestDataGenerator.generateData();

      const accessToken = authHelper.mockAuth({ userId, role });

      const authorId = 'abc';
      const bookId = 'dfg';

      const response = await request(server.instance)
        .delete(`${authorsUrl}/${authorId}/books/${bookId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send();

      expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
    });

    it('returns not found when authorBook with authorId and bookId does not exist', async () => {
      expect.assertions(1);

      const { id: userId, role } = userTestDataGenerator.generateData();

      const accessToken = authHelper.mockAuth({ userId, role });

      const { authorId, bookId } = authorBookTestDataGenerator.generateData();

      const response = await request(server.instance)
        .delete(`${authorsUrl}/${authorId}/books/${bookId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send();

      expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
    });

    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      const { title, releaseYear, language, format, price } = bookTestDataGenerator.generateData();

      const book = await bookRepository.createOne({
        title,
        releaseYear,
        language,
        format,
        price,
      });

      const { firstName, lastName } = authorTestDataGenerator.generateData();

      const author = await authorRepository.createOne({ firstName, lastName });

      await authorBookRepository.createOne({ authorId: author.id, bookId: book.id });

      const response = await request(server.instance).delete(`${authorsUrl}/${author.id}/books/${book.id}`).send();

      expect(response.statusCode).toBe(StatusCodes.UNAUTHORIZED);
    });

    it('accepts a request and returns no content when authorBookId is uuid and corresponds to existing authorBook', async () => {
      expect.assertions(1);

      const { id: userId, role } = userTestDataGenerator.generateData();

      const accessToken = authHelper.mockAuth({ userId, role });

      const { title, releaseYear, language, format, price } = bookTestDataGenerator.generateData();

      const book = await bookRepository.createOne({
        title,
        releaseYear,
        language,
        format,
        price,
      });

      const { firstName, lastName } = authorTestDataGenerator.generateData();

      const author = await authorRepository.createOne({ firstName, lastName });

      await authorBookRepository.createOne({ authorId: author.id, bookId: book.id });

      const response = await request(server.instance)
        .delete(`${authorsUrl}/${author.id}/books/${book.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send();

      expect(response.statusCode).toBe(StatusCodes.NO_CONTENT);
    });
  });
});
