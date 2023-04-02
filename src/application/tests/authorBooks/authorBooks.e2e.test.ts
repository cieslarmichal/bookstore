import 'reflect-metadata';

import request from 'supertest';
import { DataSource } from 'typeorm';

import { HttpStatusCode } from '../../../../common/http/httpStatusCode';
import { TestTransactionExternalRunner } from '../../../../common/tests/testTransactionExternalRunner';
import { DependencyInjectionContainerFactory } from '../../../../libs/dependencyInjection/dependencyInjectionContainerFactory';
import { LoggerModule } from '../../../../libs/logger/loggerModule';
import { LoggerModuleConfigTestFactory } from '../../../../libs/logger/tests/factories/loggerModuleConfigTestFactory/loggerModuleConfigTestFactory';
import { PostgresModule } from '../../../../libs/postgres/postgresModule';
import { postgresModuleSymbols } from '../../../../libs/postgres/postgresModuleSymbols';
import { PostgresModuleConfigTestFactory } from '../../../../libs/postgres/tests/factories/postgresModuleConfigTestFactory/postgresModuleConfigTestFactory';
import { UnitOfWorkModule } from '../../../../libs/unitOfWork/unitOfWorkModule';
import { HttpServer } from '../../../../server/httpServer';
import { HttpServerConfigTestFactory } from '../../../../server/tests/factories/httpServerConfigTestFactory/httpServerConfigTestFactory';
import { Application } from '../../../application';
import { AddressModule } from '../../modules/addressModule/addressModule';
import { AddressEntity } from '../../modules/addressModule/infrastructure/repositories/addressRepository/addressEntity/addressEntity';
import { AuthorBookRepositoryFactory } from '../../modules/authorBookModule/application/repositories/authorBookRepository/authorBookRepositoryFactory';
import { AuthorBookModule } from '../../modules/authorBookModule/authorBookModule';
import { authorBookModuleSymbols } from '../../modules/authorBookModule/authorBookModuleSymbols';
import { AuthorBookEntity } from '../../modules/authorBookModule/infrastructure/repositories/authorBookRepository/authorBookEntity/authorBookEntity';
import { AuthorBookEntityTestFactory } from '../../modules/authorBookModule/tests/factories/authorBookEntityTestFactory/authorBookEntityTestFactory';
import { AuthorRepositoryFactory } from '../../modules/authorModule/application/repositories/authorRepository/authorRepositoryFactory';
import { AuthorModule } from '../../modules/authorModule/authorModule';
import { authorModuleSymbols } from '../../modules/authorModule/authorModuleSymbols';
import { AuthorEntity } from '../../modules/authorModule/infrastructure/repositories/authorRepository/authorEntity/authorEntity';
import { AuthorEntityTestFactory } from '../../modules/authorModule/tests/factories/authorEntityTestFactory/authorEntityTestFactory';
import { BookCategoryModule } from '../../modules/bookCategoryModule/bookCategoryModule';
import { BookCategoryEntity } from '../../modules/bookCategoryModule/infrastructure/repositories/bookCategoryRepository/bookCategoryEntity/bookCategoryEntity';
import { BookRepositoryFactory } from '../../modules/bookModule/application/repositories/bookRepository/bookRepositoryFactory';
import { BookModule } from '../../modules/bookModule/bookModule';
import { bookModuleSymbols } from '../../modules/bookModule/bookModuleSymbols';
import { BookEntity } from '../../modules/bookModule/infrastructure/repositories/bookRepository/bookEntity/bookEntity';
import { BookEntityTestFactory } from '../../modules/bookModule/tests/factories/bookEntityTestFactory/bookEntityTestFactory';
import { CategoryModule } from '../../modules/categoryModule/categoryModule';
import { CategoryEntity } from '../../modules/categoryModule/infrastructure/repositories/categoryRepository/categoryEntity/categoryEntity';
import { CustomerModule } from '../../modules/customerModule/customerModule';
import { CustomerEntity } from '../../modules/customerModule/infrastructure/repositories/customerRepository/customerEntity/customerEntity';
import { InventoryEntity } from '../../modules/inventoryModule/infrastructure/repositories/inventoryRepository/inventoryEntity/inventoryEntity';
import { InventoryModule } from '../../modules/inventoryModule/inventoryModule';
import { CartEntity } from '../../modules/orderModule/infrastructure/repositories/cartRepository/cartEntity/cartEntity';
import { LineItemEntity } from '../../modules/orderModule/infrastructure/repositories/lineItemRepository/lineItemEntity/lineItemEntity';
import { OrderEntity } from '../../modules/orderModule/infrastructure/repositories/orderRepository/orderEntity/orderEntity';
import { OrderModule } from '../../modules/orderModule/orderModule';
import { ReviewEntity } from '../../modules/reviewModule/infrastructure/repositories/reviewRepository/reviewEntity/reviewEntity';
import { ReviewModule } from '../../modules/reviewModule/reviewModule';
import { TokenService } from '../../modules/userModule/application/services/tokenService/tokenService';
import { UserEntity } from '../../modules/userModule/infrastructure/repositories/userRepository/userEntity/userEntity';
import { UserEntityTestFactory } from '../../modules/userModule/tests/factories/userEntityTestFactory/userEntityTestFactory';
import { UserModuleConfigTestFactory } from '../../modules/userModule/tests/factories/userModuleConfigTestFactory/userModuleConfigTestFactory';
import { UserModule } from '../../modules/userModule/userModule';
import { userModuleSymbols } from '../../modules/userModule/userModuleSymbols';
import { WhishlistEntryEntity } from '../../modules/whishlistModule/infrastructure/repositories/whishlistEntryRepository/whishlistEntryEntity/whishlistEntryEntity';
import { WhishlistModule } from '../../modules/whishlistModule/whishlistModule';

const authorsUrl = '/authors';
const booksUrl = '/books';

describe(`AuthorBookController ${authorsUrl}, ${booksUrl}`, () => {
  let authorBookRepositoryFactory: AuthorBookRepositoryFactory;
  let authorRepositoryFactory: AuthorRepositoryFactory;
  let bookRepositoryFactory: BookRepositoryFactory;
  let server: HttpServer;
  let tokenService: TokenService;
  let testTransactionRunner: TestTransactionExternalRunner;
  let dataSource: DataSource;

  const authorBookEntityTestFactory = new AuthorBookEntityTestFactory();
  const authorEntityTestFactory = new AuthorEntityTestFactory();
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
        new AuthorBookModule(),
        new UserModule(userModuleConfig),
        new LoggerModule(loggerModuleConfig),
        new BookCategoryModule(),
        new AddressModule(),
        new CustomerModule(),
        new UnitOfWorkModule(),
        new OrderModule(),
        new InventoryModule(),
        new ReviewModule(),
        new WhishlistModule(),
      ],
    });

    DependencyInjectionContainerFactory.create = jest.fn().mockResolvedValue(container);

    authorRepositoryFactory = container.get<AuthorRepositoryFactory>(authorModuleSymbols.authorRepositoryFactory);
    bookRepositoryFactory = container.get<BookRepositoryFactory>(bookModuleSymbols.bookRepositoryFactory);
    authorBookRepositoryFactory = container.get<AuthorBookRepositoryFactory>(
      authorBookModuleSymbols.authorBookRepositoryFactory,
    );
    dataSource = container.get<DataSource>(postgresModuleSymbols.dataSource);
    tokenService = container.get<TokenService>(userModuleSymbols.tokenService);

    testTransactionRunner = new TestTransactionExternalRunner(container);

    const app = new Application({ ...postgresModuleConfig, ...userModuleConfig, ...loggerModuleConfig });

    await app.initialize();

    server = new HttpServer(app.instance, httpServerConfig);

    await server.listen();
  });

  afterEach(async () => {
    DependencyInjectionContainerFactory.create = createContainerFunction;

    await server.close();

    await dataSource.destroy();
  });

  describe('Create authorBook', () => {
    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { authorId, bookId } = authorBookEntityTestFactory.create();

        const response = await request(server.instance).post(`${authorsUrl}/${authorId}/books/${bookId}`);

        expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
      });
    });

    it('returns unprocessable entity when authorBook with authorId and bookId already exists', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const authorRepository = authorRepositoryFactory.create(entityManager);

        const authorBookRepository = authorBookRepositoryFactory.create(entityManager);

        const { id: userId, role } = userEntityTestFactory.create();

        const { id: bookId, isbn, format, language, price, releaseYear, title } = bookEntityTestFactory.create();

        const { id: authorId, firstName, lastName } = authorEntityTestFactory.create();

        const { id: authorBookId } = authorBookEntityTestFactory.create();

        const accessToken = tokenService.createToken({ userId, role });

        const book = await bookRepository.createOne({
          id: bookId,
          format,
          isbn,
          language,
          price,
          releaseYear,
          title,
        });

        const author = await authorRepository.createOne({ id: authorId, firstName, lastName });

        await authorBookRepository.createOne({ id: authorBookId, authorId: author.id, bookId: book.id });

        const response = await request(server.instance)
          .post(`${authorsUrl}/${author.id}/books/${book.id}`)
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(HttpStatusCode.unprocessableEntity);
      });
    });

    it('returns not found when author or book corresponding to authorId and bookId does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { id: userId, role } = userEntityTestFactory.create();

        const { authorId, bookId } = authorBookEntityTestFactory.create();

        const accessToken = tokenService.createToken({ userId, role });

        const response = await request(server.instance)
          .post(`${authorsUrl}/${authorId}/books/${bookId}`)
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(HttpStatusCode.notFound);
      });
    });

    it('returns created when all required params are provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const authorRepository = authorRepositoryFactory.create(entityManager);

        const { id: userId, role } = userEntityTestFactory.create();

        const { id: bookId, isbn, format, language, price, releaseYear, title } = bookEntityTestFactory.create();

        const { id: authorId, firstName, lastName } = authorEntityTestFactory.create();

        const accessToken = tokenService.createToken({ userId, role });

        const book = await bookRepository.createOne({
          id: bookId,
          format,
          isbn,
          language,
          price,
          releaseYear,
          title,
        });

        const author = await authorRepository.createOne({ id: authorId, firstName, lastName });

        const response = await request(server.instance)
          .post(`${authorsUrl}/${author.id}/books/${book.id}`)
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(HttpStatusCode.created);
      });
    });
  });

  describe('Find author books', () => {
    it('returns not found when author with given authorId does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { id: userId, role } = userEntityTestFactory.create();

        const { id } = authorEntityTestFactory.create();

        const accessToken = tokenService.createToken({ userId, role });

        const response = await request(server.instance)
          .get(`${authorsUrl}/${id}/books`)
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(HttpStatusCode.notFound);
      });
    });

    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const authorRepository = authorRepositoryFactory.create(entityManager);

        const { id: authorId, firstName, lastName } = authorEntityTestFactory.create();

        const author = await authorRepository.createOne({ id: authorId, firstName, lastName });

        const response = await request(server.instance).get(`${authorsUrl}/${author.id}/books`);

        expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
      });
    });

    it('returns ok when authorId is uuid and have corresponding author', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const authorRepository = authorRepositoryFactory.create(entityManager);

        const { id: userId, role } = userEntityTestFactory.create();

        const { id: authorId, firstName, lastName } = authorEntityTestFactory.create();

        const accessToken = tokenService.createToken({ userId, role });

        const author = await authorRepository.createOne({ id: authorId, firstName, lastName });

        const response = await request(server.instance)
          .get(`${authorsUrl}/${author.id}/books`)
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(HttpStatusCode.ok);
      });
    });

    it('returns books matching filter criteria', async () => {
      expect.assertions(2);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const authorRepository = authorRepositoryFactory.create(entityManager);

        const authorBookRepository = authorBookRepositoryFactory.create(entityManager);

        const { id: userId, role } = userEntityTestFactory.create();

        const bookEntity1 = bookEntityTestFactory.create();

        const bookEntity2 = bookEntityTestFactory.create();

        const authorEntity = authorEntityTestFactory.create();

        const { id: authorBookId1 } = authorBookEntityTestFactory.create();

        const { id: authorBookId2 } = authorBookEntityTestFactory.create();

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

        const author = await authorRepository.createOne({
          id: authorEntity.id,
          firstName: authorEntity.firstName,
          lastName: authorEntity.lastName,
        });

        await authorBookRepository.createOne({ id: authorBookId1, authorId: author.id, bookId: book1.id });

        await authorBookRepository.createOne({ id: authorBookId2, authorId: author.id, bookId: book2.id });

        const response = await request(server.instance)
          .get(`${authorsUrl}/${author.id}/books?filter=["title||like||${book1.title}"]`)
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(HttpStatusCode.ok);
        expect(response.body.data.books.length).toBe(1);
      });
    });
  });

  describe('Find authors of the book', () => {
    it('returns not found when book with given bookId does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { id: userId, role } = userEntityTestFactory.create();

        const { id } = bookEntityTestFactory.create();

        const accessToken = tokenService.createToken({ userId, role });

        const response = await request(server.instance)
          .get(`${booksUrl}/${id}/authors`)
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(HttpStatusCode.notFound);
      });
    });

    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const bookEntity = bookEntityTestFactory.create();

        const book = await bookRepository.createOne({
          id: bookEntity.id,
          format: bookEntity.format,
          language: bookEntity.language,
          price: bookEntity.price,
          title: bookEntity.title,
          isbn: bookEntity.isbn,
          releaseYear: bookEntity.releaseYear,
        });

        const response = await request(server.instance).get(`${booksUrl}/${book.id}/authors`);

        expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
      });
    });

    it('returns ok when bookId is uuid and have corresponding book', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const { id: userId, role } = userEntityTestFactory.create();

        const bookEntity = bookEntityTestFactory.create();

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

        const response = await request(server.instance)
          .get(`${booksUrl}/${book.id}/authors`)
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(HttpStatusCode.ok);
      });
    });

    it('returns authors matching filter criteria', async () => {
      expect.assertions(2);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const authorRepository = authorRepositoryFactory.create(entityManager);

        const authorBookRepository = authorBookRepositoryFactory.create(entityManager);

        const { id: userId, role } = userEntityTestFactory.create();

        const bookEntity = bookEntityTestFactory.create();

        const authorEntity1 = authorEntityTestFactory.create();

        const authorEntity2 = authorEntityTestFactory.create();

        const { id: authorBookId1 } = authorBookEntityTestFactory.create();

        const { id: authorBookId2 } = authorBookEntityTestFactory.create();

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

        const author1 = await authorRepository.createOne({
          id: authorEntity1.id,
          firstName: authorEntity1.firstName,
          lastName: authorEntity1.lastName,
        });

        const author2 = await authorRepository.createOne({
          id: authorEntity2.id,
          firstName: authorEntity2.firstName,
          lastName: authorEntity2.lastName,
        });

        await authorBookRepository.createOne({ id: authorBookId1, authorId: author1.id, bookId: book.id });

        await authorBookRepository.createOne({ id: authorBookId2, authorId: author2.id, bookId: book.id });

        const response = await request(server.instance)
          .get(`${booksUrl}/${book.id}/authors?filter=["firstName||like||${author1.firstName}"]`)
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(HttpStatusCode.ok);
        expect(response.body.data.authors.length).toBe(1);
      });
    });
  });

  describe('Delete authorBook', () => {
    it('returns not found when authorBook with authorId and bookId does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { id: userId, role } = userEntityTestFactory.create();

        const { authorId, bookId } = authorBookEntityTestFactory.create();

        const accessToken = tokenService.createToken({ userId, role });

        const response = await request(server.instance)
          .delete(`${authorsUrl}/${authorId}/books/${bookId}`)
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

        const authorRepository = authorRepositoryFactory.create(entityManager);

        const authorBookRepository = authorBookRepositoryFactory.create(entityManager);

        const bookEntity = bookEntityTestFactory.create();

        const authorEntity = authorEntityTestFactory.create();

        const { id: authorBookId } = authorBookEntityTestFactory.create();

        const book = await bookRepository.createOne({
          id: bookEntity.id,
          format: bookEntity.format,
          language: bookEntity.language,
          price: bookEntity.price,
          title: bookEntity.title,
          isbn: bookEntity.isbn,
          releaseYear: bookEntity.releaseYear,
        });

        const author = await authorRepository.createOne({
          id: authorEntity.id,
          firstName: authorEntity.firstName,
          lastName: authorEntity.lastName,
        });

        await authorBookRepository.createOne({ id: authorBookId, authorId: author.id, bookId: book.id });

        const response = await request(server.instance).delete(`${authorsUrl}/${author.id}/books/${book.id}`).send();

        expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
      });
    });

    it('accepts a request and returns no content when authorBookId is uuid and corresponds to existing authorBook', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const authorRepository = authorRepositoryFactory.create(entityManager);

        const authorBookRepository = authorBookRepositoryFactory.create(entityManager);

        const { id: userId, role } = userEntityTestFactory.create();

        const bookEntity = bookEntityTestFactory.create();

        const authorEntity = authorEntityTestFactory.create();

        const { id: authorBookId } = authorBookEntityTestFactory.create();

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

        const author = await authorRepository.createOne({
          id: authorEntity.id,
          firstName: authorEntity.firstName,
          lastName: authorEntity.lastName,
        });

        await authorBookRepository.createOne({ id: authorBookId, authorId: author.id, bookId: book.id });

        const response = await request(server.instance)
          .delete(`${authorsUrl}/${author.id}/books/${book.id}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send();

        expect(response.statusCode).toBe(HttpStatusCode.noContent);
      });
    });
  });
});
