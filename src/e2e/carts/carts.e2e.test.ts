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
import { AddressModule } from '../../../addressModule/addressModule';
import { AddressRepositoryFactory } from '../../../addressModule/application/repositories/addressRepository/addressRepositoryFactory';
import { AddressEntity } from '../../../addressModule/infrastructure/repositories/addressRepository/addressEntity/addressEntity';
import { AddressEntityTestFactory } from '../../../addressModule/tests/factories/addressEntityTestFactory/addressEntityTestFactory';
import { Application } from '../../../application';
import { AuthorBookModule } from '../../../authorBookModule/authorBookModule';
import { AuthorBookEntity } from '../../../authorBookModule/infrastructure/repositories/authorBookRepository/authorBookEntity/authorBookEntity';
import { AuthorModule } from '../../../authorModule/authorModule';
import { AuthorEntity } from '../../../authorModule/infrastructure/repositories/authorRepository/authorEntity/authorEntity';
import { BookCategoryModule } from '../../../bookCategoryModule/bookCategoryModule';
import { BookCategoryEntity } from '../../../bookCategoryModule/infrastructure/repositories/bookCategoryRepository/bookCategoryEntity/bookCategoryEntity';
import { BookRepositoryFactory } from '../../../bookModule/application/repositories/bookRepository/bookRepositoryFactory';
import { BookModule } from '../../../bookModule/bookModule';
import { BookEntity } from '../../../bookModule/infrastructure/repositories/bookRepository/bookEntity/bookEntity';
import { BookEntityTestFactory } from '../../../bookModule/tests/factories/bookEntityTestFactory/bookEntityTestFactory';
import { CategoryModule } from '../../../categoryModule/categoryModule';
import { CategoryEntity } from '../../../categoryModule/infrastructure/repositories/categoryRepository/categoryEntity/categoryEntity';
import { CustomerRepositoryFactory } from '../../../customerModule/application/repositories/customerRepository/customerRepositoryFactory';
import { CustomerModule } from '../../../customerModule/customerModule';
import { CustomerEntity } from '../../../customerModule/infrastructure/repositories/customerRepository/customerEntity/customerEntity';
import { CustomerEntityTestFactory } from '../../../customerModule/tests/factories/customerEntityTestFactory/customerEntityTestFactory';
import { IntegrationsModule } from '../../../integrations/integrationsModule';
import { InventoryRepositoryFactory } from '../../../inventoryModule/application/repositories/inventoryRepository/inventoryRepositoryFactory';
import { InventoryEntity } from '../../../inventoryModule/infrastructure/repositories/inventoryRepository/inventoryEntity/inventoryEntity';
import { InventoryModule } from '../../../inventoryModule/inventoryModule';
import { InventoryEntityTestFactory } from '../../../inventoryModule/tests/factories/inventoryEntityTestFactory/inventoryEntityTestFactory';
import { LineItemRepositoryFactory } from '../../../lineItemModule/application/repositories/lineItemRepository/lineItemRepositoryFactory';
import { LineItemEntity } from '../../../lineItemModule/infrastructure/repositories/lineItemRepository/lineItemEntity/lineItemEntity';
import { LineItemModule } from '../../../lineItemModule/lineItemModule';
import { LineItemEntityTestFactory } from '../../../lineItemModule/tests/factories/lineItemEntityTestFactory/lineItemEntityTestFactory';
import { OrderEntity } from '../../../orderModule/infrastructure/repositories/orderRepository/orderEntity/orderEntity';
import { OrderModule } from '../../../orderModule/orderModule';
import { ReviewEntity } from '../../../reviewModule/infrastructure/repositories/reviewRepository/reviewEntity/reviewEntity';
import { ReviewModule } from '../../../reviewModule/reviewModule';
import { UserRepositoryFactory } from '../../../userModule/application/repositories/userRepository/userRepositoryFactory';
import { TokenService } from '../../../userModule/application/services/tokenService/tokenService';
import { UserEntity } from '../../../userModule/infrastructure/repositories/userRepository/userEntity/userEntity';
import { UserEntityTestFactory } from '../../../userModule/tests/factories/userEntityTestFactory/userEntityTestFactory';
import { UserModuleConfigTestFactory } from '../../../userModule/tests/factories/userModuleConfigTestFactory/userModuleConfigTestFactory';
import { UserModule } from '../../../userModule/userModule';
import { WhishlistEntryEntity } from '../../../whishlistModule/infrastructure/repositories/whishlistEntryRepository/whishlistEntryEntity/whishlistEntryEntity';
import { WhishlistModule } from '../../../whishlistModule/whishlistModule';
import { CartRepositoryFactory } from '../../application/repositories/cartRepository/cartRepositoryFactory';
import { CartModule } from '../../cartModule';
import { CartEntityTestFactory } from '../../tests/factories/cartEntityTestFactory/cartEntityTestFactory';
import { CartEntity } from '../repositories/cartRepository/cartEntity/cartEntity';

const baseUrl = '/carts';

describe(`CartController (${baseUrl})`, () => {
  let cartRepositoryFactory: CartRepositoryFactory;
  let customerRepositoryFactory: CustomerRepositoryFactory;
  let userRepositoryFactory: UserRepositoryFactory;
  let bookRepositoryFactory: BookRepositoryFactory;
  let lineItemRepositoryFactory: LineItemRepositoryFactory;
  let addressRepositoryFactory: AddressRepositoryFactory;
  let inventoryRepositoryFactory: InventoryRepositoryFactory;

  let server: HttpServer;
  let testTransactionRunner: TestTransactionExternalRunner;
  let dataSource: DataSource;
  let tokenService: TokenService;

  const cartEntityTestFactory = new CartEntityTestFactory();
  const userEntityTestFactory = new UserEntityTestFactory();
  const customerEntityTestFactory = new CustomerEntityTestFactory();
  const bookEntityTestFactory = new BookEntityTestFactory();
  const lineItemEntityTestFactory = new LineItemEntityTestFactory();
  const addressEntityTestFactory = new AddressEntityTestFactory();
  const inventoryEntityTestFactory = new InventoryEntityTestFactory();

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
        new OrderModule(),
        new InventoryModule(),
        new ReviewModule(),
        new WhishlistModule(),
      ],
    });

    DependencyInjectionContainerFactory.create = jest.fn().mockResolvedValue(container);

    const app = new Application({ ...postgresModuleConfig, ...userModuleConfig, ...loggerModuleConfig });

    await app.initialize();

    cartRepositoryFactory = container.get<CartRepositoryFactory>(cartSymbols.cartRepositoryFactory);
    userRepositoryFactory = container.get<UserRepositoryFactory>(userModuleSymbols.userRepositoryFactory);
    customerRepositoryFactory = container.get<CustomerRepositoryFactory>(customerSymbols.customerRepositoryFactory);
    bookRepositoryFactory = container.get<BookRepositoryFactory>(bookModuleSymbols.bookRepositoryFactory);
    lineItemRepositoryFactory = container.get<LineItemRepositoryFactory>(lineItemSymbols.lineItemRepositoryFactory);
    addressRepositoryFactory = container.get<AddressRepositoryFactory>(addressModuleSymbols.addressRepositoryFactory);
    inventoryRepositoryFactory = container.get<InventoryRepositoryFactory>(inventorySymbols.inventoryRepositoryFactory);
    dataSource = container.get<DataSource>(postgresModuleSymbols.dataSource);
    tokenService = container.get<TokenService>(userModuleSymbols.tokenService);

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
        const { id: userId } = userEntityTestFactory.create();

        const accessToken = tokenService.createToken({ userId });

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

        const { id: userId, email, password } = userEntityTestFactory.create();

        const { id: customerId } = customerEntityTestFactory.create();

        const user = await userRepository.createOne({ id: userId, email: email as string, password });

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

        const { id: userId, email, password } = userEntityTestFactory.create();

        const { id: customerId } = customerEntityTestFactory.create();

        const accessToken = tokenService.createToken({ userId });

        const user = await userRepository.createOne({ id: userId, email: email as string, password });

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

        const { id: userId, email, password } = userEntityTestFactory.create();

        const { id: customerId } = customerEntityTestFactory.create();

        const accessToken = tokenService.createToken({ userId });

        const user = await userRepository.createOne({ id: userId, email: email as string, password });

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

        const { id: userId, email, password } = userEntityTestFactory.create();

        const { id: customerId } = customerEntityTestFactory.create();

        const { id: cartId, status, totalPrice } = cartEntityTestFactory.create();

        const user = await userRepository.createOne({ id: userId, email: email as string, password });

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

        const { id: userId, email, password } = userEntityTestFactory.create();

        const { id: otherUserId } = userEntityTestFactory.create();

        const { id: customerId } = customerEntityTestFactory.create();

        const { id: cartId, status, totalPrice } = cartEntityTestFactory.create();

        const accessToken = tokenService.createToken({ userId: otherUserId });

        const user = await userRepository.createOne({ id: userId, email: email as string, password });

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

        const { id: userId, email, password } = userEntityTestFactory.create();

        const { id: customerId } = customerEntityTestFactory.create();

        const { id: cartId, status, totalPrice } = cartEntityTestFactory.create();

        const accessToken = tokenService.createToken({ userId });

        const user = await userRepository.createOne({ id: userId, email: email as string, password });

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

        const addressRepository = addressRepositoryFactory.create(entityManager);

        const { id: userId, email, password } = userEntityTestFactory.create();

        const { id: customerId } = customerEntityTestFactory.create();

        const { id: cartId, status, totalPrice } = cartEntityTestFactory.create();

        const addressEntity1 = addressEntityTestFactory.create();

        const addressEntity2 = addressEntityTestFactory.create();

        const accessToken = tokenService.createToken({ userId });

        const user = await userRepository.createOne({ id: userId, email: email as string, password });

        const customer = await customerRepository.createOne({ id: customerId, userId: user.id });

        const cart = await cartRepository.createOne({
          id: cartId,
          customerId: customer.id,
          status,
          totalPrice,
        });

        const address1 = await addressRepository.createOne({
          id: addressEntity1.id,
          firstName: addressEntity1.firstName,
          lastName: addressEntity1.lastName,
          phoneNumber: addressEntity1.phoneNumber,
          country: addressEntity1.country,
          state: addressEntity1.state,
          city: addressEntity1.city,
          zipCode: addressEntity1.zipCode,
          streetAddress: addressEntity1.streetAddress,
          customerId: customer.id,
        });

        const address2 = await addressRepository.createOne({
          id: addressEntity2.id,
          firstName: addressEntity2.firstName,
          lastName: addressEntity2.lastName,
          phoneNumber: addressEntity2.phoneNumber,
          country: addressEntity2.country,
          state: addressEntity2.state,
          city: addressEntity2.city,
          zipCode: addressEntity2.zipCode,
          streetAddress: addressEntity2.streetAddress,
          customerId: customer.id,
        });

        const response = await request(server.instance)
          .patch(`${baseUrl}/${cart.id}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            billingAddressId: address1.id,
            shippingAddressId: address2.id,
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

        const { id: userId, email, password } = userEntityTestFactory.create();

        const { id: otherUserId } = userEntityTestFactory.create();

        const { id: customerId } = customerEntityTestFactory.create();

        const { id: cartId, status, totalPrice } = cartEntityTestFactory.create();

        const { quantity, bookId } = lineItemEntityTestFactory.create();

        const accessToken = tokenService.createToken({ userId: otherUserId });

        const user = await userRepository.createOne({ id: userId, email: email as string, password });

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

        const inventoryRepository = inventoryRepositoryFactory.create(entityManager);

        const { id: userId, email, password } = userEntityTestFactory.create();

        const { id: customerId } = customerEntityTestFactory.create();

        const { id: cartId, status, totalPrice } = cartEntityTestFactory.create();

        const { id: inventoryId, quantity: inventoryQuantity } = inventoryEntityTestFactory.create({ quantity: 10 });

        const bookEntity = bookEntityTestFactory.create();

        const { quantity } = lineItemEntityTestFactory.create({ quantity: 5 });

        const accessToken = tokenService.createToken({ userId });

        const user = await userRepository.createOne({ id: userId, email: email as string, password });

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

        await inventoryRepository.createOne({
          id: inventoryId,
          quantity: inventoryQuantity,
          bookId: book.id,
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

        const { id: userId, email, password } = userEntityTestFactory.create();

        const { id: otherUserId } = userEntityTestFactory.create();

        const { id: customerId } = customerEntityTestFactory.create();

        const { id: cartId, status, totalPrice } = cartEntityTestFactory.create();

        const { quantity, id: lineItemId } = lineItemEntityTestFactory.create();

        const accessToken = tokenService.createToken({ userId: otherUserId });

        const user = await userRepository.createOne({ id: userId, email: email as string, password });

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

        const { id: userId, email, password } = userEntityTestFactory.create();

        const { id: customerId } = customerEntityTestFactory.create();

        const { id: cartId, status, totalPrice } = cartEntityTestFactory.create();

        const bookEntity = bookEntityTestFactory.create();

        const { id: lineItemId, quantity, price, totalPrice: lineItemTotalPrice } = lineItemEntityTestFactory.create();

        const accessToken = tokenService.createToken({ userId });

        const user = await userRepository.createOne({ id: userId, email: email as string, password });

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

        const { id: userId, email, password } = userEntityTestFactory.create();

        const { id: customerId } = customerEntityTestFactory.create();

        const accessToken = tokenService.createToken({ userId });

        const user = await userRepository.createOne({ id: userId, email: email as string, password });

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

        const { id: userId, email, password } = userEntityTestFactory.create();

        const { id: customerId } = customerEntityTestFactory.create();

        const { id: cartId, status, totalPrice } = cartEntityTestFactory.create();

        const user = await userRepository.createOne({ id: userId, email: email as string, password });

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

        const { id: userId, email, password } = userEntityTestFactory.create();

        const { id: customerId } = customerEntityTestFactory.create();

        const { id: cartId, status, totalPrice } = cartEntityTestFactory.create();

        const accessToken = tokenService.createToken({ userId });

        const user = await userRepository.createOne({ id: userId, email: email as string, password });

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
