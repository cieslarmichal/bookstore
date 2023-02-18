import 'reflect-metadata';

import request from 'supertest';
import { DataSource } from 'typeorm';

import { HttpServer } from '../../../../server/httpServer';
import { HttpServerConfigTestFactory } from '../../../../server/tests/factories/httpServerConfigTestFactory/httpServerConfigTestFactory';
import { App } from '../../../app';
import { HttpStatusCode } from '../../../common/http/contracts/httpStatusCode';
import { AddressModule } from '../../../domain/address/addressModule';
import { AddressEntity } from '../../../domain/address/contracts/addressEntity';
import { AuthorModule } from '../../../domain/author/authorModule';
import { AuthorEntity } from '../../../domain/author/contracts/authorEntity';
import { AuthorBookModule } from '../../../domain/authorBook/authorBookModule';
import { AuthorBookEntity } from '../../../domain/authorBook/contracts/authorBookEntity';
import { BookModule } from '../../../domain/book/bookModule';
import { bookSymbols } from '../../../domain/book/bookSymbols';
import { BookEntity } from '../../../domain/book/contracts/bookEntity';
import { BookRepositoryFactory } from '../../../domain/book/contracts/factories/bookRepositoryFactory/bookRepositoryFactory';
import { BookEntityTestFactory } from '../../../domain/book/tests/factories/bookEntityTestFactory/bookEntityTestFactory';
import { BookCategoryModule } from '../../../domain/bookCategory/bookCategoryModule';
import { BookCategoryEntity } from '../../../domain/bookCategory/contracts/bookCategoryEntity';
import { CartModule } from '../../../domain/cart/cartModule';
import { cartSymbols } from '../../../domain/cart/cartSymbols';
import { CartEntity } from '../../../domain/cart/contracts/cartEntity';
import { CartRepositoryFactory } from '../../../domain/cart/contracts/factories/cartRepositoryFactory/cartRepositoryFactory';
import { CartEntityTestFactory } from '../../../domain/cart/tests/factories/cartEntityTestFactory/cartEntityTestFactory';
import { CategoryModule } from '../../../domain/category/categoryModule';
import { CategoryEntity } from '../../../domain/category/contracts/categoryEntity';
import { CustomerEntity } from '../../../domain/customer/contracts/customerEntity';
import { CustomerRepositoryFactory } from '../../../domain/customer/contracts/factories/customerRepositoryFactory/customerRepositoryFactory';
import { CustomerModule } from '../../../domain/customer/customerModule';
import { customerSymbols } from '../../../domain/customer/customerSymbols';
import { CustomerEntityTestFactory } from '../../../domain/customer/tests/factories/customerEntityTestFactory/customerEntityTestFactory';
import { LineItemRepositoryFactory } from '../../../domain/lineItem/contracts/factories/lineItemRepositoryFactory/lineItemRepositoryFactory';
import { LineItemEntity } from '../../../domain/lineItem/contracts/lineItemEntity';
import { LineItemModule } from '../../../domain/lineItem/lineItemModule';
import { lineItemSymbols } from '../../../domain/lineItem/lineItemSymbols';
import { LineItemEntityTestFactory } from '../../../domain/lineItem/tests/factories/lineItemEntityTestFactory/lineItemEntityTestFactory';
import { UserRepositoryFactory } from '../../../domain/user/contracts/factories/userRepositoryFactory/userRepositoryFactory';
import { TokenService } from '../../../domain/user/contracts/services/tokenService/tokenService';
import { UserEntity } from '../../../domain/user/contracts/userEntity';
import { UserEntityTestFactory } from '../../../domain/user/tests/factories/userEntityTestFactory/userEntityTestFactory';
import { UserModuleConfigTestFactory } from '../../../domain/user/tests/factories/userModuleConfigTestFactory/userModuleConfigTestFactory';
import { UserModule } from '../../../domain/user/userModule';
import { userSymbols } from '../../../domain/user/userSymbols';
import { DependencyInjectionContainerFactory } from '../../../libs/dependencyInjection/implementations/factories/dependencyInjectionContainerFactory/dependencyInjectionContainerFactory';
import { LoggerModule } from '../../../libs/logger/loggerModule';
import { LoggerModuleConfigTestFactory } from '../../../libs/logger/tests/factories/loggerModuleConfigTestFactory/loggerModuleConfigTestFactory';
import { PostgresModule } from '../../../libs/postgres/postgresModule';
import { postgresSymbols } from '../../../libs/postgres/postgresSymbols';
import { PostgresModuleConfigTestFactory } from '../../../libs/postgres/tests/factories/postgresModuleConfigTestFactory/postgresModuleConfigTestFactory';
import { UnitOfWorkModule } from '../../../libs/unitOfWork/unitOfWorkModule';
import { TestTransactionExternalRunner } from '../../common/tests/unitOfWork/testTransactionExternalRunner';
import { IntegrationsModule } from '../../integrationsModule';

const baseUrl = '/carts';

describe(`CartController (${baseUrl})`, () => {
  let cartRepositoryFactory: CartRepositoryFactory;
  let customerRepositoryFactory: CustomerRepositoryFactory;
  let userRepositoryFactory: UserRepositoryFactory;
  let bookRepositoryFactory: BookRepositoryFactory;
  let lineItemRepositoryFactory: LineItemRepositoryFactory;

  let server: HttpServer;
  let testTransactionRunner: TestTransactionExternalRunner;
  let dataSource: DataSource;
  let tokenService: TokenService;

  const cartEntityTestFactory = new CartEntityTestFactory();
  const userEntityTestFactory = new UserEntityTestFactory();
  const customerEntityTestFactory = new CustomerEntityTestFactory();
  const bookEntityTestFactory = new BookEntityTestFactory();
  const lineItemEntityTestFactory = new LineItemEntityTestFactory();

  const loggerModuleConfig = new LoggerModuleConfigTestFactory().create();
  const postgresModuleConfig = new PostgresModuleConfigTestFactory().create({
    entities: [
      BookEntity,
      AuthorEntity,
      UserEntity,
      CategoryEntity,
      AuthorBookEntity,
      BookCategoryEntity,
      CustomerEntity,
      CartEntity,
      BookEntity,
      LineItemEntity,
      AddressEntity,
    ],
  });
  const userModuleConfig = new UserModuleConfigTestFactory().create();
  const httpServerConfig = new HttpServerConfigTestFactory().create();

  const createContainerFunction = DependencyInjectionContainerFactory.create;

  beforeEach(async () => {
    const container = await DependencyInjectionContainerFactory.create({
      modules: [
        new PostgresModule(postgresModuleConfig),
        new CartModule(),
        new BookModule(),
        new AuthorModule(),
        new UserModule(userModuleConfig),
        new IntegrationsModule(),
        new AuthorBookModule(),
        new LoggerModule(loggerModuleConfig),
        new BookCategoryModule(),
        new CategoryModule(),
        new CustomerModule(),
        new UnitOfWorkModule(),
        new AddressModule(),
        new LineItemModule(),
      ],
    });

    DependencyInjectionContainerFactory.create = jest.fn().mockResolvedValue(container);

    const app = new App({ ...postgresModuleConfig, ...userModuleConfig, ...loggerModuleConfig });

    await app.initialize();

    cartRepositoryFactory = container.get<CartRepositoryFactory>(cartSymbols.cartRepositoryFactory);
    userRepositoryFactory = container.get<UserRepositoryFactory>(userSymbols.userRepositoryFactory);
    customerRepositoryFactory = container.get<CustomerRepositoryFactory>(customerSymbols.customerRepositoryFactory);
    bookRepositoryFactory = container.get<BookRepositoryFactory>(bookSymbols.bookRepositoryFactory);
    lineItemRepositoryFactory = container.get<LineItemRepositoryFactory>(lineItemSymbols.lineItemRepositoryFactory);
    dataSource = container.get<DataSource>(postgresSymbols.dataSource);
    tokenService = container.get<TokenService>(userSymbols.tokenService);

    testTransactionRunner = new TestTransactionExternalRunner(container);

    server = new HttpServer(app.instance, httpServerConfig);

    await server.listen();
  });

  afterEach(async () => {
    DependencyInjectionContainerFactory.create = createContainerFunction;

    await server.close();

    await dataSource.destroy();
  });

  describe('Create cart', () => {
    it('returns bad request when not all required properties in body are provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { id: userId, role } = userEntityTestFactory.create();

        const accessToken = tokenService.createToken({ userId, role });

        const response = await request(server.instance)
          .post(baseUrl)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({});

        expect(response.statusCode).toBe(HttpStatusCode.badRequest);
      });
    });

    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const userRepository = userRepositoryFactory.create(entityManager);

        const customerRepository = customerRepositoryFactory.create(entityManager);

        const { id: userId, email, password, role } = userEntityTestFactory.create();

        const { id: customerId } = customerEntityTestFactory.create();

        const user = await userRepository.createOne({ id: userId, email: email as string, password, role });

        const customer = await customerRepository.createOne({ id: customerId, userId: user.id });

        const response = await request(server.instance).post(baseUrl).send({
          customerId: customer.id,
        });

        expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
      });
    });

    it('accepts a request and returns created when all required body properties are provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const userRepository = userRepositoryFactory.create(entityManager);

        const customerRepository = customerRepositoryFactory.create(entityManager);

        const { id: userId, email, password, role } = userEntityTestFactory.create();

        const { id: customerId } = customerEntityTestFactory.create();

        const accessToken = tokenService.createToken({ userId, role });

        const user = await userRepository.createOne({ id: userId, email: email as string, password, role });

        const customer = await customerRepository.createOne({ id: customerId, userId: user.id });

        const response = await request(server.instance)
          .post(baseUrl)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            customerId: customer.id,
          });

        expect(response.statusCode).toBe(HttpStatusCode.created);
      });
    });
  });

  describe('Find cart', () => {
    it('returns not found when cart with given cartId does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const userRepository = userRepositoryFactory.create(entityManager);

        const customerRepository = customerRepositoryFactory.create(entityManager);

        const { id: userId, email, password, role } = userEntityTestFactory.create();

        const { id: customerId } = customerEntityTestFactory.create();

        const accessToken = tokenService.createToken({ userId, role });

        const user = await userRepository.createOne({ id: userId, email: email as string, password, role });

        await customerRepository.createOne({ id: customerId, userId: user.id });

        const { id } = cartEntityTestFactory.create();

        const response = await request(server.instance)
          .get(`${baseUrl}/${id}`)
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(HttpStatusCode.notFound);
      });
    });

    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const userRepository = userRepositoryFactory.create(entityManager);

        const customerRepository = customerRepositoryFactory.create(entityManager);

        const cartRepository = cartRepositoryFactory.create(entityManager);

        const { id: userId, email, password, role } = userEntityTestFactory.create();

        const { id: customerId } = customerEntityTestFactory.create();

        const { id: cartId, status, totalPrice } = cartEntityTestFactory.create();

        const user = await userRepository.createOne({ id: userId, email: email as string, password, role });

        const customer = await customerRepository.createOne({ id: customerId, userId: user.id });

        const cart = await cartRepository.createOne({
          id: cartId,
          customerId: customer.id,
          status,
          totalPrice,
        });

        const response = await request(server.instance).get(`${baseUrl}/${cart.id}`);

        expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
      });
    });

    it(`returns forbidden when user requests other customer's cart`, async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const userRepository = userRepositoryFactory.create(entityManager);

        const customerRepository = customerRepositoryFactory.create(entityManager);

        const cartRepository = cartRepositoryFactory.create(entityManager);

        const { id: userId, email, password, role } = userEntityTestFactory.create();

        const { id: otherUserId } = userEntityTestFactory.create();

        const { id: customerId } = customerEntityTestFactory.create();

        const { id: cartId, status, totalPrice } = cartEntityTestFactory.create();

        const accessToken = tokenService.createToken({ userId: otherUserId, role });

        const user = await userRepository.createOne({ id: userId, email: email as string, password, role });

        const customer = await customerRepository.createOne({ id: customerId, userId: user.id });

        const cart = await cartRepository.createOne({
          id: cartId,
          customerId: customer.id,
          status,
          totalPrice,
        });

        const response = await request(server.instance)
          .get(`${baseUrl}/${cart.id}`)
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(HttpStatusCode.forbidden);
      });
    });

    it('accepts a request and returns ok when cartId have corresponding cart', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const userRepository = userRepositoryFactory.create(entityManager);

        const customerRepository = customerRepositoryFactory.create(entityManager);

        const cartRepository = cartRepositoryFactory.create(entityManager);

        const { id: userId, email, password, role } = userEntityTestFactory.create();

        const { id: customerId } = customerEntityTestFactory.create();

        const { id: cartId, status, totalPrice } = cartEntityTestFactory.create();

        const accessToken = tokenService.createToken({ userId, role });

        const user = await userRepository.createOne({ id: userId, email: email as string, password, role });

        const customer = await customerRepository.createOne({ id: customerId, userId: user.id });

        const cart = await cartRepository.createOne({
          id: cartId,
          customerId: customer.id,
          status,
          totalPrice,
        });

        const response = await request(server.instance)
          .get(`${baseUrl}/${cart.id}`)
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(HttpStatusCode.ok);
      });
    });
  });

  describe('Update cart', () => {
    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { id, billingAddressId, shippingAddressId } = cartEntityTestFactory.create();

        const response = await request(server.instance).patch(`${baseUrl}/${id}`).send({
          billingAddressId,
          shippingAddressId,
        });

        expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
      });
    });

    it('accepts a request and returns ok when all required body properties are provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const userRepository = userRepositoryFactory.create(entityManager);

        const customerRepository = customerRepositoryFactory.create(entityManager);

        const cartRepository = cartRepositoryFactory.create(entityManager);

        const { id: userId, email, password, role } = userEntityTestFactory.create();

        const { id: customerId } = customerEntityTestFactory.create();

        const { id: cartId, billingAddressId, shippingAddressId, status, totalPrice } = cartEntityTestFactory.create();

        const { billingAddressId: updatedBillingAddressId, shippingAddressId: updatedShippingAddressId } =
          cartEntityTestFactory.create();

        const accessToken = tokenService.createToken({ userId, role });

        const user = await userRepository.createOne({ id: userId, email: email as string, password, role });

        const customer = await customerRepository.createOne({ id: customerId, userId: user.id });

        const cart = await cartRepository.createOne({
          id: cartId,
          customerId: customer.id,
          status,
          totalPrice,
          billingAddressId: billingAddressId as string,
          shippingAddressId: shippingAddressId as string,
        });

        const response = await request(server.instance)
          .patch(`${baseUrl}/${cart.id}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            billingAddressId: updatedBillingAddressId,
            shippingAddressId: updatedShippingAddressId,
          });

        expect(response.statusCode).toBe(HttpStatusCode.ok);
      });
    });
  });

  describe('Add line item', () => {
    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { id } = cartEntityTestFactory.create();

        const { quantity, bookId } = lineItemEntityTestFactory.create();

        const response = await request(server.instance).post(`${baseUrl}/${id}/add-line-item`).send({
          quantity,
          bookId,
        });

        expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
      });
    });

    it(`returns forbidden when user requests other customer's cart`, async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const userRepository = userRepositoryFactory.create(entityManager);

        const customerRepository = customerRepositoryFactory.create(entityManager);

        const cartRepository = cartRepositoryFactory.create(entityManager);

        const { id: userId, email, password, role } = userEntityTestFactory.create();

        const { id: otherUserId } = userEntityTestFactory.create();

        const { id: customerId } = customerEntityTestFactory.create();

        const { id: cartId, status, totalPrice } = cartEntityTestFactory.create();

        const { quantity, bookId } = lineItemEntityTestFactory.create();

        const accessToken = tokenService.createToken({ userId: otherUserId, role });

        const user = await userRepository.createOne({ id: userId, email: email as string, password, role });

        const customer = await customerRepository.createOne({ id: customerId, userId: user.id });

        const cart = await cartRepository.createOne({
          id: cartId,
          customerId: customer.id,
          status,
          totalPrice,
        });

        const response = await request(server.instance)
          .post(`${baseUrl}/${cart.id}/add-line-item`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            quantity,
            bookId,
          });

        expect(response.statusCode).toBe(HttpStatusCode.forbidden);
      });
    });

    it('accepts a request and returns ok when all required body properties are provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const userRepository = userRepositoryFactory.create(entityManager);

        const customerRepository = customerRepositoryFactory.create(entityManager);

        const cartRepository = cartRepositoryFactory.create(entityManager);

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const { id: userId, email, password, role } = userEntityTestFactory.create();

        const { id: customerId } = customerEntityTestFactory.create();

        const { id: cartId, status, totalPrice } = cartEntityTestFactory.create();

        const bookEntity = bookEntityTestFactory.create();

        const { quantity } = lineItemEntityTestFactory.create();

        const accessToken = tokenService.createToken({ userId, role });

        const user = await userRepository.createOne({ id: userId, email: email as string, password, role });

        const customer = await customerRepository.createOne({ id: customerId, userId: user.id });

        const cart = await cartRepository.createOne({
          id: cartId,
          customerId: customer.id,
          status,
          totalPrice,
        });

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
          .post(`${baseUrl}/${cart.id}/add-line-item`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            quantity,
            bookId: book.id,
          });

        expect(response.statusCode).toBe(HttpStatusCode.ok);
      });
    });
  });

  describe('Remove line item', () => {
    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { id } = cartEntityTestFactory.create();

        const { quantity, id: lineItemId } = lineItemEntityTestFactory.create();

        const response = await request(server.instance).post(`${baseUrl}/${id}/remove-line-item`).send({
          quantity,
          lineItemId,
        });

        expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
      });
    });

    it(`returns forbidden when user requests other customer's cart`, async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const userRepository = userRepositoryFactory.create(entityManager);

        const customerRepository = customerRepositoryFactory.create(entityManager);

        const cartRepository = cartRepositoryFactory.create(entityManager);

        const { id: userId, email, password, role } = userEntityTestFactory.create();

        const { id: otherUserId } = userEntityTestFactory.create();

        const { id: customerId } = customerEntityTestFactory.create();

        const { id: cartId, status, totalPrice } = cartEntityTestFactory.create();

        const { quantity, id: lineItemId } = lineItemEntityTestFactory.create();

        const accessToken = tokenService.createToken({ userId: otherUserId, role });

        const user = await userRepository.createOne({ id: userId, email: email as string, password, role });

        const customer = await customerRepository.createOne({ id: customerId, userId: user.id });

        const cart = await cartRepository.createOne({
          id: cartId,
          customerId: customer.id,
          status,
          totalPrice,
        });

        const response = await request(server.instance)
          .post(`${baseUrl}/${cart.id}/remove-line-item`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            quantity,
            lineItemId,
          });

        expect(response.statusCode).toBe(HttpStatusCode.forbidden);
      });
    });

    it('accepts a request and returns ok when all required body properties are provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const userRepository = userRepositoryFactory.create(entityManager);

        const customerRepository = customerRepositoryFactory.create(entityManager);

        const cartRepository = cartRepositoryFactory.create(entityManager);

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const lineItemRepository = lineItemRepositoryFactory.create(entityManager);

        const { id: userId, email, password, role } = userEntityTestFactory.create();

        const { id: customerId } = customerEntityTestFactory.create();

        const { id: cartId, status, totalPrice } = cartEntityTestFactory.create();

        const bookEntity = bookEntityTestFactory.create();

        const { id: lineItemId, quantity, price, totalPrice: lineItemTotalPrice } = lineItemEntityTestFactory.create();

        const accessToken = tokenService.createToken({ userId, role });

        const user = await userRepository.createOne({ id: userId, email: email as string, password, role });

        const customer = await customerRepository.createOne({ id: customerId, userId: user.id });

        const cart = await cartRepository.createOne({
          id: cartId,
          customerId: customer.id,
          status,
          totalPrice,
        });

        const book = await bookRepository.createOne({
          id: bookEntity.id,
          format: bookEntity.format,
          language: bookEntity.language,
          price: bookEntity.price,
          title: bookEntity.title,
          isbn: bookEntity.isbn,
          releaseYear: bookEntity.releaseYear,
        });

        const lineItem = await lineItemRepository.createOne({
          id: lineItemId,
          quantity,
          price,
          totalPrice: lineItemTotalPrice,
          bookId: book.id,
          cartId: cart.id,
        });

        const response = await request(server.instance)
          .post(`${baseUrl}/${cart.id}/remove-line-item`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            quantity,
            lineItemId: lineItem.id,
          });

        expect(response.statusCode).toBe(HttpStatusCode.ok);
      });
    });
  });

  describe('Delete cart', () => {
    it('returns not found when cart with given cartId does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const userRepository = userRepositoryFactory.create(entityManager);

        const customerRepository = customerRepositoryFactory.create(entityManager);

        const { id: userId, email, password, role } = userEntityTestFactory.create();

        const { id: customerId } = customerEntityTestFactory.create();

        const accessToken = tokenService.createToken({ userId, role });

        const user = await userRepository.createOne({ id: userId, email: email as string, password, role });

        await customerRepository.createOne({ id: customerId, userId: user.id });

        const { id } = cartEntityTestFactory.create();

        const response = await request(server.instance)
          .delete(`${baseUrl}/${id}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send();

        expect(response.statusCode).toBe(HttpStatusCode.notFound);
      });
    });

    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const userRepository = userRepositoryFactory.create(entityManager);

        const customerRepository = customerRepositoryFactory.create(entityManager);

        const cartRepository = cartRepositoryFactory.create(entityManager);

        const { id: userId, email, password, role } = userEntityTestFactory.create();

        const { id: customerId } = customerEntityTestFactory.create();

        const { id: cartId, status, totalPrice } = cartEntityTestFactory.create();

        const user = await userRepository.createOne({ id: userId, email: email as string, password, role });

        const customer = await customerRepository.createOne({ id: customerId, userId: user.id });

        const cart = await cartRepository.createOne({
          id: cartId,
          customerId: customer.id,
          status,
          totalPrice,
        });

        const response = await request(server.instance).delete(`${baseUrl}/${cart.id}`).send();

        expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
      });
    });

    it('accepts a request and returns no content when cartId is uuid and corresponds to existing cart', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const userRepository = userRepositoryFactory.create(entityManager);

        const customerRepository = customerRepositoryFactory.create(entityManager);

        const cartRepository = cartRepositoryFactory.create(entityManager);

        const { id: userId, email, password, role } = userEntityTestFactory.create();

        const { id: customerId } = customerEntityTestFactory.create();

        const { id: cartId, status, totalPrice } = cartEntityTestFactory.create();

        const accessToken = tokenService.createToken({ userId, role });

        const user = await userRepository.createOne({ id: userId, email: email as string, password, role });

        const customer = await customerRepository.createOne({ id: customerId, userId: user.id });

        const cart = await cartRepository.createOne({
          id: cartId,
          customerId: customer.id,
          status,
          totalPrice,
        });

        const response = await request(server.instance)
          .delete(`${baseUrl}/${cart.id}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send();

        expect(response.statusCode).toBe(HttpStatusCode.noContent);
      });
    });
  });
});
