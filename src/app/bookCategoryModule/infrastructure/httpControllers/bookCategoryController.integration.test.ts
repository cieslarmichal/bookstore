import { AddressModule } from '@faker-js/faker';
import 'reflect-metadata';

import request from 'supertest';
import { DataSource } from 'typeorm';

import { HttpStatusCode } from '../../../../common/http/contracts/httpStatusCode';
import { TestTransactionExternalRunner } from '../../../../common/tests/unitOfWork/testTransactionExternalRunner';
import { DependencyInjectionContainerFactory } from '../../../../libs/dependencyInjection/implementations/factories/dependencyInjectionContainerFactory/dependencyInjectionContainerFactory';
import { LoggerModule } from '../../../../libs/logger/loggerModule';
import { LoggerModuleConfigTestFactory } from '../../../../libs/logger/tests/factories/loggerModuleConfigTestFactory/loggerModuleConfigTestFactory';
import { PostgresModule } from '../../../../libs/postgres/postgresModule';
import { postgresSymbols } from '../../../../libs/postgres/postgresSymbols';
import { PostgresModuleConfigTestFactory } from '../../../../libs/postgres/tests/factories/postgresModuleConfigTestFactory/postgresModuleConfigTestFactory';
import { UnitOfWorkModule } from '../../../../libs/unitOfWork/unitOfWorkModule';
import { HttpServer } from '../../../../server/httpServer';
import { HttpServerConfigTestFactory } from '../../../../server/tests/factories/httpServerConfigTestFactory/httpServerConfigTestFactory';
import { AddressEntity } from '../../../addressModule/infrastructure/repositories/addressRepository/addressEntity/addressEntity';
import { App } from '../../../app';
import { AuthorBookModule } from '../../../authorBookModule/authorBookModule';
import { AuthorBookEntity } from '../../../authorBookModule/infrastructure/repositories/authorBookRepository/authorBookEntity/authorBookEntity';
import { AuthorModule } from '../../../authorModule/authorModule';
import { AuthorEntity } from '../../../authorModule/infrastructure/repositories/authorRepository/authorEntity/authorEntity';
import { BookRepositoryFactory } from '../../../bookModule/application/repositories/bookRepository/bookRepositoryFactory';
import { BookModule } from '../../../bookModule/bookModule';
import { BookFormat } from '../../../bookModule/domain/entities/book/bookFormat';
import { BookEntity } from '../../../bookModule/infrastructure/repositories/bookRepository/bookEntity/bookEntity';
import { BookEntityTestFactory } from '../../../bookModule/tests/factories/bookEntityTestFactory/bookEntityTestFactory';
import { CartModule } from '../../../cartModule/cartModule';
import { CartEntity } from '../../../cartModule/infrastructure/repositories/cartRepository/cartEntity/cartEntity';
import { CategoryRepositoryFactory } from '../../../categoryModule/application/repositories/categoryRepository/categoryRepositoryFactory';
import { CategoryModule } from '../../../categoryModule/categoryModule';
import { CategoryEntity } from '../../../categoryModule/infrastructure/repositories/categoryRepository/categoryEntity/categoryEntity';
import { CategoryEntityTestFactory } from '../../../categoryModule/tests/factories/categoryEntityTestFactory/categoryEntityTestFactory';
import { CustomerModule } from '../../../customerModule/customerModule';
import { CustomerEntity } from '../../../customerModule/infrastructure/repositories/customerRepository/customerEntity/customerEntity';
import { IntegrationsModule } from '../../../integrations/integrationsModule';
import { InventoryEntity } from '../../../inventoryModule/infrastructure/repositories/inventoryRepository/inventoryEntity/inventoryEntity';
import { InventoryModule } from '../../../inventoryModule/inventoryModule';
import { LineItemEntity } from '../../../lineItemModule/infrastructure/repositories/lineItemRepository/lineItemEntity/lineItemEntity';
import { LineItemModule } from '../../../lineItemModule/lineItemModule';
import { OrderEntity } from '../../../orderModule/infrastructure/repositories/orderRepository/orderEntity/orderEntity';
import { OrderModule } from '../../../orderModule/orderModule';
import { ReviewEntity } from '../../../reviewModule/infrastructure/repositories/reviewRepository/reviewEntity/reviewEntity';
import { ReviewModule } from '../../../reviewModule/reviewModule';
import { TokenService } from '../../../userModule/application/services/tokenService/tokenService';
import { UserEntity } from '../../../userModule/infrastructure/repositories/userRepository/userEntity/userEntity';
import { UserEntityTestFactory } from '../../../userModule/tests/factories/userEntityTestFactory/userEntityTestFactory';
import { UserModuleConfigTestFactory } from '../../../userModule/tests/factories/userModuleConfigTestFactory/userModuleConfigTestFactory';
import { UserModule } from '../../../userModule/userModule';
import { WhishlistEntryEntity } from '../../../whishlistModule/infrastructure/repositories/whishlistEntryRepository/whishlistEntryEntity/whishlistEntryEntity';
import { WhishlistModule } from '../../../whishlistModule/whishlistModule';
import { BookCategoryRepositoryFactory } from '../../application/repositories/bookCategoryRepository/bookCategoryRepositoryFactory';
import { BookCategoryModule } from '../../bookCategoryModule';
import { BookCategoryEntityTestFactory } from '../../tests/factories/bookCategoryEntityTestFactory/bookCategoryEntityTestFactory';
import { BookCategoryEntity } from '../repositories/bookCategoryRepository/bookCategoryEntity/bookCategoryEntity';

const categoriesUrl = '/categories';
const booksUrl = '/books';

describe(`BookCategoryController ${categoriesUrl}, ${booksUrl}`, () => {
  let bookCategoryRepositoryFactory: BookCategoryRepositoryFactory;
  let categoryRepositoryFactory: CategoryRepositoryFactory;
  let bookRepositoryFactory: BookRepositoryFactory;
  let server: HttpServer;
  let tokenService: TokenService;
  let testTransactionRunner: TestTransactionExternalRunner;
  let dataSource: DataSource;

  const bookCategoryEntityTestFactory = new BookCategoryEntityTestFactory();
  const categoryEntityTestFactory = new CategoryEntityTestFactory();
  const bookEntityTestFactory = new BookEntityTestFactory();
  const userEntityTestFactory = new UserEntityTestFactory();

  const loggerModuleConfig = new LoggerModuleConfigTestFactory().create();
  const postgresModuleConfig = new PostgresModuleConfigTestFactory().create({
    entities: [
      BookEntity,
      AuthorEntity,
      UserEntity,
      CategoryEntity,
      AuthorBookEntity,
      BookCategoryEntity,
      AddressEntity,
      CustomerEntity,
      CartEntity,
      LineItemEntity,
      OrderEntity,
      InventoryEntity,
      ReviewEntity,
      WhishlistEntryEntity,
    ],
  });
  const userModuleConfig = new UserModuleConfigTestFactory().create();
  const httpServerConfig = new HttpServerConfigTestFactory().create();

  const createContainerFunction = DependencyInjectionContainerFactory.create;

  beforeEach(async () => {
    const container = await DependencyInjectionContainerFactory.create({
      modules: [
        new PostgresModule(postgresModuleConfig),
        new CategoryModule(),
        new BookModule(),
        new AuthorModule(),
        new BookCategoryModule(),
        new AuthorBookModule(),
        new UserModule(userModuleConfig),
        new IntegrationsModule(),
        new LoggerModule(loggerModuleConfig),
        new AddressModule(),
        new CustomerModule(),
        new UnitOfWorkModule(),
        new CartModule(),
        new LineItemModule(),
        new OrderModule(),
        new InventoryModule(),
        new ReviewModule(),
        new WhishlistModule(),
      ],
    });

    DependencyInjectionContainerFactory.create = jest.fn().mockResolvedValue(container);

    categoryRepositoryFactory = container.get<CategoryRepositoryFactory>(categorySymbols.categoryRepositoryFactory);
    bookRepositoryFactory = container.get<BookRepositoryFactory>(bookSymbols.bookRepositoryFactory);
    bookCategoryRepositoryFactory = container.get<BookCategoryRepositoryFactory>(
      bookCategorySymbols.bookCategoryRepositoryFactory,
    );
    dataSource = container.get<DataSource>(postgresSymbols.dataSource);
    tokenService = container.get<TokenService>(userSymbols.tokenService);

    testTransactionRunner = new TestTransactionExternalRunner(container);

    const app = new App({ ...postgresModuleConfig, ...userModuleConfig, ...loggerModuleConfig });

    await app.initialize();

    server = new HttpServer(app.instance, httpServerConfig);

    await server.listen();
  });

  afterEach(async () => {
    DependencyInjectionContainerFactory.create = createContainerFunction;

    await server.close();

    await dataSource.destroy();
  });

  describe('Create bookCategory', () => {
    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { categoryId, bookId } = bookCategoryEntityTestFactory.create();

        const response = await request(server.instance).post(`${booksUrl}/${bookId}/categories/${categoryId}`);

        expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
      });
    });

    it('returns unprocessable entity when bookCategory with categoryId and bookId already exists', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const categoryRepository = categoryRepositoryFactory.create(entityManager);

        const bookCategoryRepository = bookCategoryRepositoryFactory.create(entityManager);

        const { id: userId, role } = userEntityTestFactory.create();

        const bookEntity = bookEntityTestFactory.create();

        const categoryEntity = categoryEntityTestFactory.create();

        const { id } = bookCategoryEntityTestFactory.create();

        const accessToken = tokenService.createToken({ userId, role });

        const book = await bookRepository.createOne({
          id: bookEntity.id,
          format: bookEntity.format,
          language: bookEntity.language,
          price: bookEntity.price,
          title: bookEntity.title,
          isbn: bookEntity.isbn,
          releaseYear: bookEntity.releaseYear,
        });

        const category = await categoryRepository.createOne(categoryEntity);

        await bookCategoryRepository.createOne({ id, categoryId: category.id, bookId: book.id });

        const response = await request(server.instance)
          .post(`${booksUrl}/${book.id}/categories/${category.id}`)
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(HttpStatusCode.unprocessableEntity);
      });
    });

    it('returns not found when category or book corresponding to categoryId and bookId does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { id: userId, role } = userEntityTestFactory.create();

        const { categoryId, bookId } = bookCategoryEntityTestFactory.create();

        const accessToken = tokenService.createToken({ userId, role });

        const response = await request(server.instance)
          .post(`${booksUrl}/${bookId}/categories/${categoryId}`)
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(HttpStatusCode.notFound);
      });
    });

    it('returns created when all required params are provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const categoryRepository = categoryRepositoryFactory.create(entityManager);

        const { id: userId, role } = userEntityTestFactory.create();

        const bookEntity = bookEntityTestFactory.create();

        const categoryEntity = categoryEntityTestFactory.create();

        const accessToken = tokenService.createToken({ userId, role });

        const book = await bookRepository.createOne({
          id: bookEntity.id,
          format: bookEntity.format,
          language: bookEntity.language,
          price: bookEntity.price,
          title: bookEntity.title,
          isbn: bookEntity.isbn,
          releaseYear: bookEntity.releaseYear,
        });

        const category = await categoryRepository.createOne(categoryEntity);

        const response = await request(server.instance)
          .post(`${booksUrl}/${book.id}/categories/${category.id}`)
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(HttpStatusCode.created);
      });
    });
  });

  describe('Find category books', () => {
    it('returns not found when category with given categoryId does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { id: userId, role } = userEntityTestFactory.create();

        const { id } = categoryEntityTestFactory.create();

        const accessToken = tokenService.createToken({ userId, role });

        const response = await request(server.instance)
          .get(`${categoriesUrl}/${id}/books`)
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(HttpStatusCode.notFound);
      });
    });

    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const { id, name } = categoryEntityTestFactory.create();

        const categoryRepository = categoryRepositoryFactory.create(entityManager);

        const category = await categoryRepository.createOne({ id, name });

        const response = await request(server.instance).get(`${categoriesUrl}/${category.id}/books`);

        expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
      });
    });

    it('returns books matching filter criteria', async () => {
      expect.assertions(2);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const categoryRepository = categoryRepositoryFactory.create(entityManager);

        const bookCategoryRepository = bookCategoryRepositoryFactory.create(entityManager);

        const { id: userId, role } = userEntityTestFactory.create();

        const bookEntity1 = bookEntityTestFactory.create({ format: BookFormat.paperback });

        const bookEntity2 = bookEntityTestFactory.create({ format: BookFormat.hardcover });

        const bookEntity3 = bookEntityTestFactory.create({ format: BookFormat.kindle });

        const categoryEntity = categoryEntityTestFactory.create();

        const { id: bookCategoryId1 } = bookCategoryEntityTestFactory.create();

        const { id: bookCategoryId2 } = bookCategoryEntityTestFactory.create();

        const { id: bookCategoryId3 } = bookCategoryEntityTestFactory.create();

        const accessToken = tokenService.createToken({ userId, role });

        const book1 = await bookRepository.createOne({
          id: bookEntity1.id,
          format: bookEntity1.format,
          language: bookEntity1.language,
          price: bookEntity1.price,
          title: bookEntity1.title,
          isbn: bookEntity1.isbn,
          releaseYear: bookEntity1.releaseYear,
        });

        const book2 = await bookRepository.createOne({
          id: bookEntity2.id,
          format: bookEntity2.format,
          language: bookEntity2.language,
          price: bookEntity2.price,
          title: bookEntity2.title,
          isbn: bookEntity2.isbn,
          releaseYear: bookEntity2.releaseYear,
        });

        const book3 = await bookRepository.createOne({
          id: bookEntity3.id,
          format: bookEntity3.format,
          language: bookEntity3.language,
          price: bookEntity3.price,
          title: bookEntity3.title,
          isbn: bookEntity2.isbn,
          releaseYear: bookEntity3.releaseYear,
        });

        const category = await categoryRepository.createOne(categoryEntity);

        await bookCategoryRepository.createOne({ id: bookCategoryId1, categoryId: category.id, bookId: book1.id });

        await bookCategoryRepository.createOne({ id: bookCategoryId2, categoryId: category.id, bookId: book2.id });

        await bookCategoryRepository.createOne({ id: bookCategoryId3, categoryId: category.id, bookId: book3.id });

        const response = await request(server.instance)
          .get(`${categoriesUrl}/${category.id}/books?filter=["format||eq||paperback,hardcover"]`)
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(HttpStatusCode.ok);
        expect(response.body.data.books.length).toBe(2);
      });
    });
  });

  describe('Find categories of the book', () => {
    it('returns not found when book with given bookId does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { id: userId, role } = userEntityTestFactory.create();

        const { id } = bookEntityTestFactory.create();

        const accessToken = tokenService.createToken({ userId, role });

        const response = await request(server.instance)
          .get(`${booksUrl}/${id}/categories`)
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(HttpStatusCode.notFound);
      });
    });

    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const { id, title, isbn, releaseYear, language, format, price } = bookEntityTestFactory.create();

        const book = await bookRepository.createOne({
          id,
          title,
          isbn,
          releaseYear,
          language,
          format,
          price,
        });

        const response = await request(server.instance).get(`${booksUrl}/${book.id}/categories`);

        expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
      });
    });

    it('returns categories matching filter criteria', async () => {
      expect.assertions(2);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const categoryRepository = categoryRepositoryFactory.create(entityManager);

        const bookCategoryRepository = bookCategoryRepositoryFactory.create(entityManager);

        const { id: userId, role } = userEntityTestFactory.create();

        const bookEntity = bookEntityTestFactory.create();

        const categoryEntity1 = categoryEntityTestFactory.create();

        const categoryEntity2 = categoryEntityTestFactory.create();

        const { id: bookCategoryId1 } = bookCategoryEntityTestFactory.create();

        const { id: bookCategoryId2 } = bookCategoryEntityTestFactory.create();

        const accessToken = tokenService.createToken({ userId, role });

        const book = await bookRepository.createOne({
          id: bookEntity.id,
          format: bookEntity.format,
          language: bookEntity.language,
          price: bookEntity.price,
          title: bookEntity.title,
          isbn: bookEntity.isbn,
          releaseYear: bookEntity.releaseYear,
        });

        const category1 = await categoryRepository.createOne(categoryEntity1);

        const category2 = await categoryRepository.createOne(categoryEntity2);

        await bookCategoryRepository.createOne({ id: bookCategoryId1, categoryId: category1.id, bookId: book.id });

        await bookCategoryRepository.createOne({ id: bookCategoryId2, categoryId: category2.id, bookId: book.id });

        const response = await request(server.instance)
          .get(`${booksUrl}/${book.id}/categories?filter=["name||eq||${categoryEntity1.name}"]`)
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(HttpStatusCode.ok);
        expect(response.body.data.categories.length).toBe(1);
      });
    });
  });

  describe('Delete bookCategory', () => {
    it('returns not found when bookCategory with categoryId and bookId does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { id: userId, role } = userEntityTestFactory.create();

        const { categoryId, bookId } = bookCategoryEntityTestFactory.create();

        const accessToken = tokenService.createToken({ userId, role });

        const response = await request(server.instance)
          .delete(`${booksUrl}/${bookId}/categories/${categoryId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send();

        expect(response.statusCode).toBe(HttpStatusCode.notFound);
      });
    });

    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const categoryRepository = categoryRepositoryFactory.create(entityManager);

        const bookCategoryRepository = bookCategoryRepositoryFactory.create(entityManager);

        const bookEntity = bookEntityTestFactory.create();

        const categoryEntity = categoryEntityTestFactory.create();

        const { id: bookCategoryId } = bookCategoryEntityTestFactory.create();

        const book = await bookRepository.createOne({
          id: bookEntity.id,
          format: bookEntity.format,
          language: bookEntity.language,
          price: bookEntity.price,
          title: bookEntity.title,
          isbn: bookEntity.isbn,
          releaseYear: bookEntity.releaseYear,
        });

        const category = await categoryRepository.createOne(categoryEntity);

        await bookCategoryRepository.createOne({ id: bookCategoryId, categoryId: category.id, bookId: book.id });

        const response = await request(server.instance)
          .delete(`${booksUrl}/${book.id}/categories/${category.id}`)
          .send();

        expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
      });
    });

    it('accepts a request and returns no content when bookCategoryId is uuid and corresponds to existing bookCategory', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const categoryRepository = categoryRepositoryFactory.create(entityManager);

        const bookCategoryRepository = bookCategoryRepositoryFactory.create(entityManager);

        const { id: userId, role } = userEntityTestFactory.create();

        const bookEntity = bookEntityTestFactory.create();

        const categoryEntity = categoryEntityTestFactory.create();

        const { id: bookCategoryId } = bookCategoryEntityTestFactory.create();

        const accessToken = tokenService.createToken({ userId, role });

        const book = await bookRepository.createOne({
          id: bookEntity.id,
          format: bookEntity.format,
          language: bookEntity.language,
          price: bookEntity.price,
          title: bookEntity.title,
          isbn: bookEntity.isbn,
          releaseYear: bookEntity.releaseYear,
        });

        const category = await categoryRepository.createOne(categoryEntity);

        await bookCategoryRepository.createOne({ id: bookCategoryId, categoryId: category.id, bookId: book.id });

        const response = await request(server.instance)
          .delete(`${booksUrl}/${book.id}/categories/${category.id}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send();

        expect(response.statusCode).toBe(HttpStatusCode.noContent);
      });
    });
  });
});
