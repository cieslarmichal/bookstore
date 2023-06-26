import 'reflect-metadata';

import { BookEntityTestFactory } from '../../../application/modules/bookModule/tests/factories/bookEntityTestFactory/bookEntityTestFactory';
import { CustomerEntityTestFactory } from '../../../application/modules/customerModule/tests/factories/customerEntityTestFactory/customerEntityTestFactory';
import { InventoryEntityTestFactory } from '../../../application/modules/inventoryModule/tests/factories/inventoryEntityTestFactory/inventoryEntityTestFactory';
import { CartStatus } from '../../../application/modules/orderModule/domain/entities/cart/cartStatus';
import { DeliveryMethod } from '../../../application/modules/orderModule/domain/entities/cart/deliveryMethod';
import { CartEntityTestFactory } from '../../../application/modules/orderModule/tests/factories/cartEntityTestFactory/cartEntityTestFactory';
import { LineItemEntityTestFactory } from '../../../application/modules/orderModule/tests/factories/lineItemEntityTestFactory/lineItemEntityTestFactory';
import { OrderEntityTestFactory } from '../../../application/modules/orderModule/tests/factories/orderEntityTestFactory/orderEntityTestFactory';
import { UserEntityTestFactory } from '../../../application/modules/userModule/tests/factories/userEntityTestFactory/userEntityTestFactory';
import { HttpStatusCode } from '../../../common/http/httpStatusCode';
import { FetchClientImpl } from '../../../libs/http/clients/fetchClient/fetchClientImpl';
import { HttpServiceFactoryImpl } from '../../../libs/http/factories/httpServiceFactory/httpServiceFactoryImpl';
import { LoggerClientFactoryImpl } from '../../../libs/logger/factories/loggerClientFactory/loggerClientFactoryImpl';
import { LogLevel } from '../../../libs/logger/logLevel';
import { LoggerServiceImpl } from '../../../libs/logger/services/loggerService/loggerServiceImpl';
import { AuthService } from '../../services/authService/authService';
import { BookService } from '../../services/bookService/bookService';
import { CustomerService } from '../../services/customerService/customerService';
import { UserService } from '../../services/userService/userService';

const baseUrl = '/orders';

describe(`OrderController (${baseUrl})`, () => {
  const cartEntityTestFactory = new CartEntityTestFactory();
  const userEntityTestFactory = new UserEntityTestFactory();
  const customerEntityTestFactory = new CustomerEntityTestFactory();
  const bookEntityTestFactory = new BookEntityTestFactory();
  const lineItemEntityTestFactory = new LineItemEntityTestFactory();
  const orderEntityTestFactory = new OrderEntityTestFactory();
  const inventoryEntityTestFactory = new InventoryEntityTestFactory();

  const httpService = new HttpServiceFactoryImpl(
    new FetchClientImpl(),
    new LoggerServiceImpl(new LoggerClientFactoryImpl({ logLevel: LogLevel.error }).create()),
  ).create({ baseUrl: '/' });

  const userService = new UserService(httpService);
  const authService = new AuthService(httpService);
  const customerService = new CustomerService(httpService);
  const bookService = new BookService(httpService);

  describe('Create order', () => {
    it('returns bad request when not all required properties in body are provided', async () => {
      expect.assertions(1);

      const { id: userId } = userEntityTestFactory.create();

      const accessToken = tokenService.createToken({ userId });

      const response = await request(server.instance)
        .post(baseUrl)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({});

      expect(response.statusCode).toBe(HttpStatusCode.badRequest);
    });

    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      const { id: userId, email, password } = userEntityTestFactory.create();

      const { id: customerId } = customerEntityTestFactory.create();

      const { id: cartId } = cartEntityTestFactory.create();

      const { paymentMethod } = orderEntityTestFactory.create();

      const user = await userRepository.createOne({ id: userId, email: email as string, password });

      await customerRepository.createOne({ id: customerId, userId: user.id });

      const response = await request(server.instance).post(baseUrl).send({
        cartId,
        paymentMethod,
      });

      expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
    });

    it('accepts a request and returns created when all required body properties are provided', async () => {
      expect.assertions(1);

      const { id: userId, email, password } = userEntityTestFactory.create();

      const { id: customerId } = customerEntityTestFactory.create();

      const { paymentMethod } = orderEntityTestFactory.create();

      const {
        id: cartId,
        status,
        totalPrice,
        billingAddressId,
        shippingAddressId,
        deliveryMethod,
      } = cartEntityTestFactory.create({ status: CartStatus.active });

      const bookEntity = bookEntityTestFactory.create();

      const { id: lineItemId, quantity, price } = lineItemEntityTestFactory.create({ quantity: 2 });

      const { id: inventoryId, quantity: inventoryQuantity } = inventoryEntityTestFactory.create({ quantity: 10 });

      const accessToken = tokenService.createToken({ userId });

      const user = await userRepository.createOne({ id: userId, email: email as string, password });

      const customer = await customerRepository.createOne({ id: customerId, userId: user.id });

      const cart = await cartRepository.createOne({
        id: cartId,
        customerId: customer.id,
        status,
        totalPrice,
        billingAddressId: billingAddressId as string,
        shippingAddressId: shippingAddressId as string,
        deliveryMethod: deliveryMethod as DeliveryMethod,
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

      await lineItemRepository.createOne({
        id: lineItemId,
        quantity,
        price,
        totalPrice,
        bookId: book.id,
        cartId: cart.id,
      });

      const response = await request(server.instance).post(baseUrl).set('Authorization', `Bearer ${accessToken}`).send({
        cartId: cart.id,
        paymentMethod,
      });

      expect(response.statusCode).toBe(HttpStatusCode.created);
    });
  });

  describe('Find orders', () => {
    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      const { id: userId, email, password } = userEntityTestFactory.create();

      const { id: customerId } = customerEntityTestFactory.create();

      const {
        id: cartId,
        status: cartStatus,
        totalPrice,
      } = cartEntityTestFactory.create({ status: CartStatus.active });

      const { id: orderId, paymentMethod, orderNumber, status: orderStatus } = orderEntityTestFactory.create();

      const user = await userRepository.createOne({ id: userId, email: email as string, password });

      const customer = await customerRepository.createOne({ id: customerId, userId: user.id });

      await cartRepository.createOne({
        id: cartId,
        customerId: customer.id,
        status: cartStatus,
        totalPrice,
      });

      await orderRepository.createOne({
        id: orderId,
        paymentMethod,
        orderNumber,
        status: orderStatus,
        cartId,
        customerId,
      });

      const response = await request(server.instance).get(`${baseUrl}`);

      expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
    });

    it('accepts a request and returns ok', async () => {
      expect.assertions(1);

      const { id: userId, email, password } = userEntityTestFactory.create();

      const { id: customerId } = customerEntityTestFactory.create();

      const {
        id: cartId,
        status: cartStatus,
        totalPrice,
      } = cartEntityTestFactory.create({ status: CartStatus.active });

      const { id: orderId, paymentMethod, orderNumber, status: orderStatus } = orderEntityTestFactory.create();

      const accessToken = tokenService.createToken({ userId });

      const user = await userRepository.createOne({ id: userId, email: email as string, password });

      const customer = await customerRepository.createOne({ id: customerId, userId: user.id });

      await cartRepository.createOne({
        id: cartId,
        customerId: customer.id,
        status: cartStatus,
        totalPrice,
      });

      await orderRepository.createOne({
        id: orderId,
        paymentMethod,
        orderNumber,
        status: orderStatus,
        cartId,
        customerId,
      });

      const response = await request(server.instance).get(`${baseUrl}`).set('Authorization', `Bearer ${accessToken}`);

      expect(response.statusCode).toBe(HttpStatusCode.ok);
    });
  });
});
