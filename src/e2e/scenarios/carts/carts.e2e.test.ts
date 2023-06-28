import 'reflect-metadata';

import { AddressEntityTestFactory } from '../../../application/modules/addressModule/tests/factories/addressEntityTestFactory/addressEntityTestFactory';
import { BookEntityTestFactory } from '../../../application/modules/bookModule/tests/factories/bookEntityTestFactory/bookEntityTestFactory';
import { InventoryEntityTestFactory } from '../../../application/modules/inventoryModule/tests/factories/inventoryEntityTestFactory/inventoryEntityTestFactory';
import { AddLineItemResponseOkBody } from '../../../application/modules/orderModule/api/httpControllers/cartHttpController/schemas/addLineItemSchema';
import { CartEntityTestFactory } from '../../../application/modules/orderModule/tests/factories/cartEntityTestFactory/cartEntityTestFactory';
import { LineItemEntityTestFactory } from '../../../application/modules/orderModule/tests/factories/lineItemEntityTestFactory/lineItemEntityTestFactory';
import { UserEntityTestFactory } from '../../../application/modules/userModule/tests/factories/userEntityTestFactory/userEntityTestFactory';
import { HttpHeader } from '../../../common/http/httpHeader';
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

const baseUrl = '/carts';

describe(`Carts e2e`, () => {
  const cartEntityTestFactory = new CartEntityTestFactory();
  const userEntityTestFactory = new UserEntityTestFactory();
  const bookEntityTestFactory = new BookEntityTestFactory();
  const lineItemEntityTestFactory = new LineItemEntityTestFactory();
  const addressEntityTestFactory = new AddressEntityTestFactory();
  const inventoryEntityTestFactory = new InventoryEntityTestFactory();

  const httpService = new HttpServiceFactoryImpl(
    new FetchClientImpl(),
    new LoggerServiceImpl(new LoggerClientFactoryImpl({ logLevel: LogLevel.error }).create()),
  ).create({ baseUrl: '127.0.0.1:3000/' });

  const userService = new UserService(httpService);
  const authService = new AuthService(httpService);
  const customerService = new CustomerService(httpService);
  const bookService = new BookService(httpService);
  const cartService = new CartService(httpService);
  const addressService = new AddressService(httpService);
  const inventoryService = new InventoryService(httpService);

  describe('Create cart', () => {
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

      const { email, password } = userEntityTestFactory.create();

      const { user } = await userService.createUser({ email: email as string, password });

      const accessToken = await authService.getUserToken({ email: email as string, password });

      const { customer } = await customerService.createCustomer({ userId: user.id }, accessToken);

      const response = await httpService.sendRequest({
        endpoint: baseUrl,
        method: HttpMethodName.post,
        body: {
          customerId: customer.id,
        },
      });

      expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
    });

    it('accepts a request and returns created when all required body properties are provided', async () => {
      expect.assertions(1);

      const { email, password } = userEntityTestFactory.create();

      const { user } = await userService.createUser({ email: email as string, password });

      const accessToken = await authService.getUserToken({ email: email as string, password });

      const { customer } = await customerService.createCustomer({ userId: user.id }, accessToken);

      const response = await httpService.sendRequest({
        endpoint: baseUrl,
        method: HttpMethodName.post,
        headers: { [HttpHeader.authorization]: `Bearer ${accessToken}` },
        body: {
          customerId: customer.id,
        },
      });

      expect(response.statusCode).toBe(HttpStatusCode.created);
    });
  });

  describe('Find cart', () => {
    it('returns not found when cart with given cartId does not exist', async () => {
      expect.assertions(1);

      const { email, password } = userEntityTestFactory.create();

      const { user } = await userService.createUser({ email: email as string, password });

      const accessToken = await authService.getUserToken({ email: email as string, password });

      await customerService.createCustomer({ userId: user.id }, accessToken);

      const { id } = cartEntityTestFactory.create();

      const response = await httpService.sendRequest({
        endpoint: `${baseUrl}/${id}`,
        method: HttpMethodName.get,
        headers: { [HttpHeader.authorization]: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(HttpStatusCode.notFound);
    });

    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      const { id } = cartEntityTestFactory.create();

      const response = await httpService.sendRequest({
        endpoint: `${baseUrl}/${id}`,
        method: HttpMethodName.get,
      });

      expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
    });

    it('accepts a request and returns ok when cartId have corresponding cart', async () => {
      expect.assertions(1);

      const { email, password } = userEntityTestFactory.create();

      const { user } = await userService.createUser({ email: email as string, password });

      const accessToken = await authService.getUserToken({ email: email as string, password });

      const { customer } = await customerService.createCustomer({ userId: user.id }, accessToken);

      const { cart } = await cartService.createCart(
        {
          customerId: customer.id,
        },
        accessToken,
      );

      const response = await httpService.sendRequest({
        endpoint: `${baseUrl}/${cart.id}`,
        method: HttpMethodName.get,
        headers: { [HttpHeader.authorization]: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(HttpStatusCode.ok);
    });
  });

  describe('Update cart', () => {
    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      const { id, billingAddressId, shippingAddressId } = cartEntityTestFactory.create();

      const response = await httpService.sendRequest({
        endpoint: `${baseUrl}/${id}`,
        method: HttpMethodName.patch,
        body: {
          billingAddressId,
          shippingAddressId,
        },
      });

      expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
    });

    it('accepts a request and returns ok when all required body properties are provided', async () => {
      expect.assertions(1);

      const addressEntity1 = addressEntityTestFactory.create();

      const addressEntity2 = addressEntityTestFactory.create();

      const { email, password } = userEntityTestFactory.create();

      const { user } = await userService.createUser({ email: email as string, password });

      const accessToken = await authService.getUserToken({ email: email as string, password });

      const { customer } = await customerService.createCustomer({ userId: user.id }, accessToken);

      const { cart } = await cartService.createCart(
        {
          customerId: customer.id,
        },
        accessToken,
      );

      const { address: address1 } = await addressService.createAddress(
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

      const { address: address2 } = await addressService.createAddress(
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

      const response = await httpService.sendRequest({
        endpoint: `${baseUrl}/${cart.id}`,
        method: HttpMethodName.patch,
        body: {
          billingAddressId: address1.id,
          shippingAddressId: address2.id,
        },
        headers: { [HttpHeader.authorization]: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(HttpStatusCode.ok);
    });
  });

  describe('Add line item', () => {
    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      const { id } = cartEntityTestFactory.create();

      const { quantity, bookId } = lineItemEntityTestFactory.create();

      const response = await httpService.sendRequest({
        endpoint: `${baseUrl}/${id}/add-line-item`,
        method: HttpMethodName.post,
        body: {
          quantity,
          bookId,
        },
      });

      expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
    });

    it('accepts a request and returns ok when all required body properties are provided', async () => {
      expect.assertions(1);

      const { quantity: inventoryQuantity } = inventoryEntityTestFactory.create({ quantity: 10 });

      const bookEntity = bookEntityTestFactory.create();

      const { quantity } = lineItemEntityTestFactory.create({ quantity: 5 });

      const { email, password } = userEntityTestFactory.create();

      const { user } = await userService.createUser({ email: email as string, password });

      const accessToken = await authService.getUserToken({ email: email as string, password });

      const { customer } = await customerService.createCustomer({ userId: user.id }, accessToken);

      const { cart } = await cartService.createCart(
        {
          customerId: customer.id,
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

      const response = await httpService.sendRequest({
        endpoint: `${baseUrl}/${cart.id}/add-line-item`,
        method: HttpMethodName.post,
        body: {
          quantity,
          bookId: book.id,
        },
        headers: { [HttpHeader.authorization]: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(HttpStatusCode.ok);
    });
  });

  describe('Remove line item', () => {
    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      const { id } = cartEntityTestFactory.create();

      const { quantity, id: lineItemId } = lineItemEntityTestFactory.create();

      const response = await httpService.sendRequest({
        endpoint: `${baseUrl}/${id}/remove-line-item`,
        method: HttpMethodName.post,
        body: {
          quantity,
          lineItemId,
        },
      });

      expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
    });

    it('accepts a request and returns ok when all required body properties are provided', async () => {
      expect.assertions(1);

      const { quantity: inventoryQuantity } = inventoryEntityTestFactory.create({ quantity: 10 });

      const bookEntity = bookEntityTestFactory.create();

      const { email, password } = userEntityTestFactory.create();

      const { user } = await userService.createUser({ email: email as string, password });

      const accessToken = await authService.getUserToken({ email: email as string, password });

      const { customer } = await customerService.createCustomer({ userId: user.id }, accessToken);

      const { cart } = await cartService.createCart(
        {
          customerId: customer.id,
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

      const { cart: responseCart } = await cartService.addLineItem(
        cart.id,
        { bookId: book.id, quantity: 1 },
        accessToken,
      );

      const lineItemId = responseCart.lineItems?.[0]?.id;

      const removeLineItemResponse = await httpService.sendRequest<AddLineItemResponseOkBody>({
        endpoint: `${baseUrl}/${cart.id}/remove-line-item`,
        method: HttpMethodName.post,
        body: {
          quantity: 1,
          lineItemId: lineItemId,
        },
        headers: { [HttpHeader.authorization]: `Bearer ${accessToken}` },
      });

      expect(removeLineItemResponse.statusCode).toBe(HttpStatusCode.ok);
    });
  });

  describe('Delete cart', () => {
    it('returns not found when cart with given cartId does not exist', async () => {
      expect.assertions(1);

      const { email, password } = userEntityTestFactory.create();

      const { user } = await userService.createUser({ email: email as string, password });

      const accessToken = await authService.getUserToken({ email: email as string, password });

      await customerService.createCustomer({ userId: user.id }, accessToken);

      const { id } = cartEntityTestFactory.create();

      const response = await httpService.sendRequest<AddLineItemResponseOkBody>({
        endpoint: `${baseUrl}/${id}`,
        method: HttpMethodName.delete,
        headers: { [HttpHeader.authorization]: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(HttpStatusCode.notFound);
    });

    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      const { email, password } = userEntityTestFactory.create();

      const { user } = await userService.createUser({ email: email as string, password });

      const accessToken = await authService.getUserToken({ email: email as string, password });

      const { customer } = await customerService.createCustomer({ userId: user.id }, accessToken);

      const { cart } = await cartService.createCart(
        {
          customerId: customer.id,
        },
        accessToken,
      );

      const response = await httpService.sendRequest<AddLineItemResponseOkBody>({
        endpoint: `${baseUrl}/${cart.id}`,
        method: HttpMethodName.delete,
      });

      expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
    });

    it('accepts a request and returns no content when cartId is uuid and corresponds to existing cart', async () => {
      expect.assertions(1);

      const { email, password } = userEntityTestFactory.create();

      const { user } = await userService.createUser({ email: email as string, password });

      const accessToken = await authService.getUserToken({ email: email as string, password });

      const { customer } = await customerService.createCustomer({ userId: user.id }, accessToken);

      const { cart } = await cartService.createCart(
        {
          customerId: customer.id,
        },
        accessToken,
      );

      const response = await httpService.sendRequest<AddLineItemResponseOkBody>({
        endpoint: `${baseUrl}/${cart.id}`,
        method: HttpMethodName.delete,
        headers: { [HttpHeader.authorization]: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(HttpStatusCode.noContent);
    });
  });
});
