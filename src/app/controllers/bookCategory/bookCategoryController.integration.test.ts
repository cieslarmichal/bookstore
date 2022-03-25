import { ConfigLoader } from '../../../configLoader';
import { CategoryTestDataGenerator } from '../../domain/category/testDataGenerators/categoryTestDataGenerator';
import request from 'supertest';
import { App } from '../../../app';
import { createDIContainer } from '../../shared';
import { DbModule } from '../../shared';
import { ControllersModule } from '../controllersModule';
import { BookModule } from '../../domain/book/bookModule';
import { Server } from '../../../server';
import { BookCategoryRepository } from '../../domain/bookCategory/repositories/bookCategoryRepository';
import { UserTestDataGenerator } from '../../domain/user/testDataGenerators/userTestDataGenerator';
import { StatusCodes } from 'http-status-codes';
import { PostgresHelper } from '../../../integration/helpers/postgresHelper/postgresHelper';
import { AuthHelper } from '../../../integration/helpers';
import { UserModule } from '../../domain/user/userModule';
import { CategoryModule } from '../../domain/category/categoryModule';
import { BookCategoryModule } from '../../domain/bookCategory/bookCategoryModule';
import { CategoryRepository } from '../../domain/category/repositories/categoryRepository';
import { BookRepository } from '../../domain/book/repositories/bookRepository';
import { BookTestDataGenerator } from '../../domain/book/testDataGenerators/bookTestDataGenerator';
import { BookCategoryTestDataGenerator } from '../../domain/bookCategory/testDataGenerators/bookCategoryTestDataGenerator';
import { LoggerModule } from '../../shared/logger/loggerModule';
import { BOOK_REPOSITORY } from '../../domain/book/bookInjectionSymbols';
import { BOOK_CATEGORY_REPOSITORY } from '../../domain/bookCategory/bookCategoryInjectionSymbols';
import { AuthorModule } from '../../domain/author/authorModule';
import { CATEGORY_REPOSITORY } from '../../domain/category/categoryInjectionSymbols';
import { AuthorBookModule } from '../../domain/authorBook/authorBookModule';
import { BookFormat } from '../../domain/book/types';

const categoriesUrl = '/categories';
const booksUrl = '/books';

describe(`BookCategoryController`, () => {
  let bookCategoryRepository: BookCategoryRepository;
  let categoryRepository: CategoryRepository;
  let bookRepository: BookRepository;
  let bookCategoryTestDataGenerator: BookCategoryTestDataGenerator;
  let categoryTestDataGenerator: CategoryTestDataGenerator;
  let bookTestDataGenerator: BookTestDataGenerator;
  let userTestDataGenerator: UserTestDataGenerator;
  let server: Server;
  let authHelper: AuthHelper;

  beforeAll(async () => {
    ConfigLoader.loadConfig();

    bookCategoryTestDataGenerator = new BookCategoryTestDataGenerator();
    userTestDataGenerator = new UserTestDataGenerator();
    categoryTestDataGenerator = new CategoryTestDataGenerator();
    bookTestDataGenerator = new BookTestDataGenerator();
  });

  beforeEach(async () => {
    const container = await createDIContainer([
      DbModule,
      CategoryModule,
      BookModule,
      AuthorModule,
      BookCategoryModule,
      AuthorBookModule,
      UserModule,
      ControllersModule,
      LoggerModule,
    ]);

    categoryRepository = container.resolve(CATEGORY_REPOSITORY);
    bookRepository = container.resolve(BOOK_REPOSITORY);
    bookCategoryRepository = container.resolve(BOOK_CATEGORY_REPOSITORY);

    authHelper = new AuthHelper(container);

    const app = new App(container);

    server = new Server(app.instance);

    server.listen();
  });

  afterEach(async () => {
    server.close();

    await PostgresHelper.removeDataFromTables();
  });

  describe('Create bookCategory', () => {
    it('returns bad request when categoryId or bookId are not uuid', async () => {
      expect.assertions(1);

      const { id: userId, role } = userTestDataGenerator.generateData();

      const accessToken = authHelper.mockAuth({ userId, role });

      const categoryId = '123';
      const bookId = '123';

      const response = await request(server.instance)
        .post(`${booksUrl}/${bookId}/categories/${categoryId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
    });

    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      const { categoryId, bookId } = bookCategoryTestDataGenerator.generateData();

      const response = await request(server.instance).post(`${booksUrl}/${bookId}/categories/${categoryId}`);

      expect(response.statusCode).toBe(StatusCodes.UNAUTHORIZED);
    });

    it('returns unprocessable entity when bookCategory with categoryId and bookId already exists', async () => {
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

      const { name } = categoryTestDataGenerator.generateData();

      const category = await categoryRepository.createOne({ name });

      await bookCategoryRepository.createOne({ categoryId: category.id, bookId: book.id });

      const response = await request(server.instance)
        .post(`${booksUrl}/${book.id}/categories/${category.id}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.statusCode).toBe(StatusCodes.UNPROCESSABLE_ENTITY);
    });

    it('returns not found when category or book corresponding to categoryId and bookId does not exist', async () => {
      expect.assertions(1);

      const { id: userId, role } = userTestDataGenerator.generateData();

      const accessToken = authHelper.mockAuth({ userId, role });

      const { categoryId, bookId } = bookCategoryTestDataGenerator.generateData();

      const response = await request(server.instance)
        .post(`${booksUrl}/${bookId}/categories/${categoryId}`)
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

      const { name } = categoryTestDataGenerator.generateData();

      const category = await categoryRepository.createOne({ name });

      const response = await request(server.instance)
        .post(`${booksUrl}/${book.id}/categories/${category.id}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.statusCode).toBe(StatusCodes.CREATED);
    });
  });

  describe('Find category books', () => {
    it('returns bad request the categoryId param is not uuid', async () => {
      expect.assertions(1);

      const { id: userId, role } = userTestDataGenerator.generateData();

      const accessToken = authHelper.mockAuth({ userId, role });

      const categoryId = 'abc';

      const response = await request(server.instance)
        .get(`${categoriesUrl}/${categoryId}/books`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
    });

    it('returns not found when category with given categoryId does not exist', async () => {
      expect.assertions(1);

      const { id: userId, role } = userTestDataGenerator.generateData();

      const accessToken = authHelper.mockAuth({ userId, role });

      const { id } = categoryTestDataGenerator.generateData();

      const response = await request(server.instance)
        .get(`${categoriesUrl}/${id}/books`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
    });

    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      const { name } = categoryTestDataGenerator.generateData();

      const category = await categoryRepository.createOne({ name });

      const response = await request(server.instance).get(`${categoriesUrl}/${category.id}/books`);

      expect(response.statusCode).toBe(StatusCodes.UNAUTHORIZED);
    });

    it('returns books matching filter criteria', async () => {
      expect.assertions(2);

      const { id: userId, role } = userTestDataGenerator.generateData();

      const accessToken = authHelper.mockAuth({ userId, role });

      const { title, releaseYear, language, price } = bookTestDataGenerator.generateData();

      const book1 = await bookRepository.createOne({
        title,
        releaseYear,
        language,
        format: BookFormat.paperback,
        price,
      });

      const { title: otherTitle } = bookTestDataGenerator.generateData();

      const book2 = await bookRepository.createOne({
        title: otherTitle,
        releaseYear,
        language,
        format: BookFormat.hardcover,
        price,
      });

      const { name } = categoryTestDataGenerator.generateData();

      const category = await categoryRepository.createOne({ name });

      await bookCategoryRepository.createOne({ categoryId: category.id, bookId: book1.id });
      await bookCategoryRepository.createOne({ categoryId: category.id, bookId: book2.id });

      const response = await request(server.instance)
        .get(`${categoriesUrl}/${category.id}/books?filter=["format||eq||paperback"]`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.statusCode).toBe(StatusCodes.OK);
      expect(response.body.data.books.length).toBe(1);
    });
  });

  describe('Find categories of the book', () => {
    it('returns bad request the bookId param is not uuid', async () => {
      expect.assertions(1);

      const { id: userId, role } = userTestDataGenerator.generateData();

      const accessToken = authHelper.mockAuth({ userId, role });

      const bookId = 'abc';

      const response = await request(server.instance)
        .get(`${booksUrl}/${bookId}/categories`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
    });

    it('returns not found when book with given bookId does not exist', async () => {
      expect.assertions(1);

      const { id: userId, role } = userTestDataGenerator.generateData();

      const accessToken = authHelper.mockAuth({ userId, role });

      const { id } = bookTestDataGenerator.generateData();

      const response = await request(server.instance)
        .get(`${booksUrl}/${id}/categories`)
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

      const response = await request(server.instance).get(`${booksUrl}/${book.id}/categories`);

      expect(response.statusCode).toBe(StatusCodes.UNAUTHORIZED);
    });

    it('returns categories matchin filter criteria', async () => {
      expect.assertions(2);

      const { id: userId, role } = userTestDataGenerator.generateData();

      const accessToken = authHelper.mockAuth({ userId, role });

      const { title, releaseYear, language, price, format } = bookTestDataGenerator.generateData();

      const book = await bookRepository.createOne({
        title,
        releaseYear,
        language,
        format,
        price,
      });

      const { name } = categoryTestDataGenerator.generateData();

      const category1 = await categoryRepository.createOne({ name });

      const { name: otherName } = categoryTestDataGenerator.generateData();

      const category2 = await categoryRepository.createOne({ name: otherName });

      await bookCategoryRepository.createOne({ categoryId: category1.id, bookId: book.id });
      await bookCategoryRepository.createOne({ categoryId: category2.id, bookId: book.id });

      const response = await request(server.instance)
        .get(`${booksUrl}/${book.id}/categories?filter=["name||eq||${name}"]`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.statusCode).toBe(StatusCodes.OK);
      expect(response.body.data.categories.length).toBe(1);
    });
  });

  describe('Remove bookCategory', () => {
    it('returns bad request when categoryId or bookId params are not uuid', async () => {
      expect.assertions(1);

      const { id: userId, role } = userTestDataGenerator.generateData();

      const accessToken = authHelper.mockAuth({ userId, role });

      const categoryId = 'abc';
      const bookId = 'dfg';

      const response = await request(server.instance)
        .delete(`${booksUrl}/${bookId}/categories/${categoryId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send();

      expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
    });

    it('returns not found when bookCategory with categoryId and bookId does not exist', async () => {
      expect.assertions(1);

      const { id: userId, role } = userTestDataGenerator.generateData();

      const accessToken = authHelper.mockAuth({ userId, role });

      const { categoryId, bookId } = bookCategoryTestDataGenerator.generateData();

      const response = await request(server.instance)
        .delete(`${booksUrl}/${bookId}/categories/${categoryId}`)
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

      const { name } = categoryTestDataGenerator.generateData();

      const category = await categoryRepository.createOne({ name });

      await bookCategoryRepository.createOne({ categoryId: category.id, bookId: book.id });

      const response = await request(server.instance).delete(`${booksUrl}/${book.id}/categories/${category.id}`).send();

      expect(response.statusCode).toBe(StatusCodes.UNAUTHORIZED);
    });

    it('accepts a request and returns no content when bookCategoryId is uuid and corresponds to existing bookCategory', async () => {
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

      const { name } = categoryTestDataGenerator.generateData();

      const category = await categoryRepository.createOne({ name });

      await bookCategoryRepository.createOne({ categoryId: category.id, bookId: book.id });

      const response = await request(server.instance)
        .delete(`${booksUrl}/${book.id}/categories/${category.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send();

      expect(response.statusCode).toBe(StatusCodes.NO_CONTENT);
    });
  });
});
