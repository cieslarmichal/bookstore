import 'reflect-metadata';

import { AddressEntityTestFactory } from '../../../application/modules/addressModule/tests/factories/addressEntityTestFactory/addressEntityTestFactory';
import { BookEntityTestFactory } from '../../../application/modules/bookModule/tests/factories/bookEntityTestFactory/bookEntityTestFactory';
import { InventoryEntityTestFactory } from '../../../application/modules/inventoryModule/tests/factories/inventoryEntityTestFactory/inventoryEntityTestFactory';
import { DeliveryMethod } from '../../../application/modules/orderModule/domain/entities/cart/deliveryMethod';
import { CartEntityTestFactory } from '../../../application/modules/orderModule/tests/factories/cartEntityTestFactory/cartEntityTestFactory';
import { OrderEntityTestFactory } from '../../../application/modules/orderModule/tests/factories/orderEntityTestFactory/orderEntityTestFactory';
import { UserEntityTestFactory } from '../../../application/modules/userModule/tests/factories/userEntityTestFactory/userEntityTestFactory';
import { HttpHeader } from '../../../common/http/httpHeader';
import { HttpMediaType } from '../../../common/http/httpMediaType';
import { HttpMethodName } from '../../../common/http/httpMethodName';
import { HttpStatusCode } from '../../../common/http/httpStatusCode';
import { FetchClientImpl } from '../../../libs/http/clients/fetchClient/fetchClientImpl';
import { HttpServiceFactoryImpl } from '../../../libs/http/factories/httpServiceFactory/httpServiceFactoryImpl';
import { LoggerClientFactoryImpl } from '../../../libs/logger/factories/loggerClientFactory/loggerClientFactoryImpl';
import { LogLevel } from '../../../libs/logger/logLevel';
import { LoggerServiceImpl } from '../../../libs/logger/services/loggerService/loggerServiceImpl';
import { AddressService } from '../../services/addressService/addressService';
import { AuthService } from '../../services/authService/authService';
import { BookService } from '../../services/bookService/bookService';
import { CartService } from '../../services/cartService/cartService';
import { CustomerService } from '../../services/customerService/customerService';
import { InventoryService } from '../../services/inventoryService/inventoryService';
import { UserService } from '../../services/userService/userService';

const baseUrl = '/orders';

describe(`Orders e2e`, () => {
  const cartEntityTestFactory = new CartEntityTestFactory();
  const userEntityTestFactory = new UserEntityTestFactory();
  const bookEntityTestFactory = new BookEntityTestFactory();
  const orderEntityTestFactory = new OrderEntityTestFactory();
  const inventoryEntityTestFactory = new InventoryEntityTestFactory();
  const addressEntityTestFactory = new AddressEntityTestFactory();

  const httpService = new HttpServiceFactoryImpl(
    new FetchClientImpl(),
    new LoggerServiceImpl(new LoggerClientFactoryImpl({ logLevel: LogLevel.error }).create()),
  ).create({ baseUrl: 'http://127.0.0.1:3000', headers: { [HttpHeader.contentType]: HttpMediaType.applicationJson } });

  const userService = new UserService(httpService);
  const authService = new AuthService(httpService);
  const customerService = new CustomerService(httpService);
  const bookService = new BookService(httpService);
  const cartService = new CartService(httpService);
  const inventoryService = new InventoryService(httpService);
  const addressService = new AddressService(httpService);

  describe('Create order', () => {
    it('returns bad request when not all required properties in body are provided', async () => {
      expect.assertions(1);

      const { email, password } = userEntityTestFactory.create();

      const { user } = await userService.createUser({ email: email as string, password });

      const accessToken = await authService.getUserToken({ email: email as string, password });

      await customerService.createCustomer({ userId: user.id }, accessToken);

      const response = await httpService.sendRequest({
        endpoint: baseUrl,
        method: HttpMethodName.post,
        headers: { [HttpHeader.authorization]: `Bearer ${accessToken}` },
        body: {},
      });

      expect(response.statusCode).toBe(HttpStatusCode.badRequest);
    });

    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      const { id: cartId } = cartEntityTestFactory.create();

      const { paymentMethod } = orderEntityTestFactory.create();

      const response = await httpService.sendRequest({
        endpoint: baseUrl,
        method: HttpMethodName.post,
        body: {
          cartId,
          paymentMethod,
        },
      });

      expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
    });

    it('accepts a request and returns created when all required body properties are provided', async () => {
      expect.assertions(1);

      const { paymentMethod } = orderEntityTestFactory.create();

      const bookEntity = bookEntityTestFactory.create();

      const { quantity: inventoryQuantity } = inventoryEntityTestFactory.create({ quantity: 10 });

      const { email, password } = userEntityTestFactory.create();

      const addressEntity1 = addressEntityTestFactory.create();

      const addressEntity2 = addressEntityTestFactory.create();

      const { user } = await userService.createUser({ email: email as string, password });

      const accessToken = await authService.getUserToken({ email: email as string, password });

      const { customer } = await customerService.createCustomer({ userId: user.id }, accessToken);

      const { address: shippingAddress } = await addressService.createAddress(
        {
          firstName: addressEntity1.firstName,
          lastName: addressEntity1.lastName,
          phoneNumber: addressEntity1.phoneNumber,
          country: addressEntity1.country,
          state: addressEntity1.state,
          city: addressEntity1.city,
          zipCode: addressEntity1.zipCode,
          streetAddress: addressEntity1.streetAddress,
          customerId: customer.id,
        },
        accessToken,
      );

      const { address: billingAddress } = await addressService.createAddress(
        {
          firstName: addressEntity2.firstName,
          lastName: addressEntity2.lastName,
          phoneNumber: addressEntity2.phoneNumber,
          country: addressEntity2.country,
          state: addressEntity2.state,
          city: addressEntity2.city,
          zipCode: addressEntity2.zipCode,
          streetAddress: addressEntity2.streetAddress,
          customerId: customer.id,
        },
        accessToken,
      );

      const { cart } = await cartService.createCart(
        {
          customerId: customer.id,
        },
        accessToken,
      );

      await cartService.updateCart(
        cart.id,
        {
          billingAddressId: billingAddress.id as string,
          shippingAddressId: shippingAddress.id as string,
          deliveryMethod: DeliveryMethod.fedex,
        },
        accessToken,
      );

      const { book } = await bookService.createBook(
        {
          format: bookEntity.format,
          language: bookEntity.language,
          price: bookEntity.price,
          title: bookEntity.title,
          isbn: bookEntity.isbn,
          releaseYear: bookEntity.releaseYear,
        },
        accessToken,
      );

      await inventoryService.createInventory(
        {
          quantity: inventoryQuantity,
          bookId: book.id,
        },
        accessToken,
      );

      await cartService.addLineItem(
        cart.id,
        {
          bookId: book.id,
          quantity: 1,
        },
        accessToken,
      );

      const response = await httpService.sendRequest({
        endpoint: baseUrl,
        method: HttpMethodName.post,
        headers: { [HttpHeader.authorization]: `Bearer ${accessToken}` },
        body: {
          cartId: cart.id,
          paymentMethod,
        },
      });

      expect(response.statusCode).toBe(HttpStatusCode.created);
    });
  });

  describe('Find orders', () => {
    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      const response = await httpService.sendRequest({
        endpoint: baseUrl,
        method: HttpMethodName.get,
      });

      expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
    });

    it('accepts a request and returns ok', async () => {
      expect.assertions(1);

      const { email, password } = userEntityTestFactory.create();

      const { user } = await userService.createUser({ email: email as string, password });

      const accessToken = await authService.getUserToken({ email: email as string, password });

      await customerService.createCustomer({ userId: user.id }, accessToken);

      const response = await httpService.sendRequest({
        endpoint: baseUrl,
        method: HttpMethodName.get,
        headers: { [HttpHeader.authorization]: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(HttpStatusCode.ok);
    });
  });
});
