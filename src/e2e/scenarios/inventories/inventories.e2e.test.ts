import 'reflect-metadata';

import { BookEntityTestFactory } from '../../../application/modules/bookModule/tests/factories/bookEntityTestFactory/bookEntityTestFactory';
import { InventoryEntityTestFactory } from '../../../application/modules/inventoryModule/tests/factories/inventoryEntityTestFactory/inventoryEntityTestFactory';
import { UserEntityTestFactory } from '../../../application/modules/userModule/tests/factories/userEntityTestFactory/userEntityTestFactory';
import { HttpHeader } from '../../../common/http/httpHeader';
import { HttpMethodName } from '../../../common/http/httpMethodName';
import { HttpStatusCode } from '../../../common/http/httpStatusCode';
import { FetchClientImpl } from '../../../libs/http/clients/fetchClient/fetchClientImpl';
import { HttpServiceFactoryImpl } from '../../../libs/http/factories/httpServiceFactory/httpServiceFactoryImpl';
import { LoggerClientFactoryImpl } from '../../../libs/logger/factories/loggerClientFactory/loggerClientFactoryImpl';
import { LogLevel } from '../../../libs/logger/logLevel';
import { LoggerServiceImpl } from '../../../libs/logger/services/loggerService/loggerServiceImpl';
import { AuthService } from '../../services/authService/authService';
import { BookService } from '../../services/bookService/bookService';
import { CustomerService } from '../../services/customerService/customerService';
import { InventoryService } from '../../services/inventoryService/inventoryService';
import { UserService } from '../../services/userService/userService';

const baseUrl = '/inventories';

describe(`Inventories e2e`, () => {
  const bookEntityTestFactory = new BookEntityTestFactory();
  const userEntityTestFactory = new UserEntityTestFactory();
  const inventoryEntityTestFactory = new InventoryEntityTestFactory();

  const httpService = new HttpServiceFactoryImpl(
    new FetchClientImpl(),
    new LoggerServiceImpl(new LoggerClientFactoryImpl({ logLevel: LogLevel.error }).create()),
  ).create({ baseUrl: '127.0.0.1:3000/' });

  const userService = new UserService(httpService);
  const authService = new AuthService(httpService);
  const customerService = new CustomerService(httpService);
  const inventoryService = new InventoryService(httpService);
  const bookService = new BookService(httpService);

  describe('Create inventory', () => {
    it('returns bad request when not all required properties in body are provided', async () => {
      expect.assertions(1);

      const { email, password } = userEntityTestFactory.create();

      const { user } = await userService.createUser({ email: email as string, password });

      const accessToken = await authService.getUserToken({ email: email as string, password });

      await customerService.createCustomer({ userId: user.id }, accessToken);

      const { bookId } = inventoryEntityTestFactory.create();

      const response = await httpService.sendRequest({
        endpoint: baseUrl,
        method: HttpMethodName.post,
        headers: { [HttpHeader.authorization]: `Bearer ${accessToken}` },
        body: {
          bookId,
        },
      });

      expect(response.statusCode).toBe(HttpStatusCode.badRequest);
    });

    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      const { quantity } = inventoryEntityTestFactory.create();

      const { title, isbn, releaseYear, language, format, price } = bookEntityTestFactory.create();

      const { email, password } = userEntityTestFactory.create();

      await userService.createUser({ email: email as string, password });

      const accessToken = await authService.getUserToken({ email: email as string, password });

      const { book } = await bookService.createBook(
        {
          title,
          isbn,
          releaseYear,
          language,
          format,
          price,
        },
        accessToken,
      );

      const response = await httpService.sendRequest({
        endpoint: baseUrl,
        method: HttpMethodName.post,
        body: {
          bookId: book.id,
          quantity,
        },
      });

      expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
    });

    it('accepts a request and returns created when all required body properties are provided and book with given id exists', async () => {
      expect.assertions(1);

      const { title, isbn, releaseYear, language, format, price } = bookEntityTestFactory.create();

      const { quantity } = inventoryEntityTestFactory.create();

      const { email, password } = userEntityTestFactory.create();

      const { user } = await userService.createUser({ email: email as string, password });

      const accessToken = await authService.getUserToken({ email: email as string, password });

      await customerService.createCustomer({ userId: user.id }, accessToken);

      const { book } = await bookService.createBook(
        {
          title,
          isbn,
          releaseYear,
          language,
          format,
          price,
        },
        accessToken,
      );

      const response = await httpService.sendRequest({
        endpoint: baseUrl,
        method: HttpMethodName.post,
        headers: { [HttpHeader.authorization]: `Bearer ${accessToken}` },
        body: {
          bookId: book.id,
          quantity,
        },
      });

      expect(response.statusCode).toBe(HttpStatusCode.created);
    });
  });

  describe('Find inventory', () => {
    it('returns not found when book with given inventoryId does not exist', async () => {
      expect.assertions(1);

      const { id } = inventoryEntityTestFactory.create();

      const { email, password } = userEntityTestFactory.create();

      const { user } = await userService.createUser({ email: email as string, password });

      const accessToken = await authService.getUserToken({ email: email as string, password });

      await customerService.createCustomer({ userId: user.id }, accessToken);

      const response = await httpService.sendRequest({
        endpoint: `${baseUrl}/${id}`,
        method: HttpMethodName.get,
        headers: { [HttpHeader.authorization]: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(HttpStatusCode.notFound);
    });

    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      const { id } = inventoryEntityTestFactory.create();

      const response = await httpService.sendRequest({
        endpoint: `${baseUrl}/${id}`,
        method: HttpMethodName.get,
      });

      expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
    });

    it('accepts a request and returns ok when inventoryId is uuid and have corresponding inventory', async () => {
      expect.assertions(1);

      const { title, isbn, releaseYear, language, format, price } = bookEntityTestFactory.create();

      const { quantity } = inventoryEntityTestFactory.create();

      const { email, password } = userEntityTestFactory.create();

      const { user } = await userService.createUser({ email: email as string, password });

      const accessToken = await authService.getUserToken({ email: email as string, password });

      await customerService.createCustomer({ userId: user.id }, accessToken);

      const { book } = await bookService.createBook(
        {
          title,
          isbn,
          releaseYear,
          language,
          format,
          price,
        },
        accessToken,
      );

      const { inventory } = await inventoryService.createInventory(
        {
          bookId: book.id,
          quantity,
        },
        accessToken,
      );

      const response = await httpService.sendRequest({
        endpoint: `${baseUrl}/${inventory.id}`,
        method: HttpMethodName.get,
        headers: { [HttpHeader.authorization]: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(HttpStatusCode.ok);
    });
  });

  describe('Find inventories', () => {
    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      const response = await httpService.sendRequest({
        endpoint: baseUrl,
        method: HttpMethodName.get,
      });

      expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
    });

    it('accepts request', async () => {
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

  describe('Update inventory', () => {
    it('returns not found when inventory with given id does not exist', async () => {
      expect.assertions(1);

      const { quantity } = inventoryEntityTestFactory.create();

      const { email, password } = userEntityTestFactory.create();

      const { user } = await userService.createUser({ email: email as string, password });

      const accessToken = await authService.getUserToken({ email: email as string, password });

      await customerService.createCustomer({ userId: user.id }, accessToken);

      const { id } = inventoryEntityTestFactory.create();

      const response = await httpService.sendRequest({
        endpoint: `${baseUrl}/${id}`,
        method: HttpMethodName.patch,
        headers: { [HttpHeader.authorization]: `Bearer ${accessToken}` },
        body: {
          quantity: quantity + 1,
        },
      });

      expect(response.statusCode).toBe(HttpStatusCode.notFound);
    });

    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      const { id: inventoryId, quantity } = inventoryEntityTestFactory.create();

      const response = await httpService.sendRequest({
        endpoint: `${baseUrl}/${inventoryId}`,
        method: HttpMethodName.patch,
        body: {
          quantity: quantity + 1,
        },
      });

      expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
    });

    it('accepts a request and returns ok when inventoryId corresponds to existing inventory', async () => {
      expect.assertions(1);

      const { title, isbn, releaseYear, language, format, price } = bookEntityTestFactory.create();

      const { quantity } = inventoryEntityTestFactory.create();

      const { email, password } = userEntityTestFactory.create();

      const { user } = await userService.createUser({ email: email as string, password });

      const accessToken = await authService.getUserToken({ email: email as string, password });

      await customerService.createCustomer({ userId: user.id }, accessToken);

      const { book } = await bookService.createBook(
        {
          title,
          isbn,
          releaseYear,
          language,
          format,
          price,
        },
        accessToken,
      );

      const { inventory } = await inventoryService.createInventory(
        {
          bookId: book.id,
          quantity,
        },
        accessToken,
      );

      const response = await httpService.sendRequest({
        endpoint: `${baseUrl}/${inventory.id}`,
        method: HttpMethodName.patch,
        headers: { [HttpHeader.authorization]: `Bearer ${accessToken}` },
        body: {
          quantity: quantity + 1,
        },
      });

      expect(response.statusCode).toBe(HttpStatusCode.ok);
    });
  });

  describe('Delete inventory', () => {
    it('returns not found when inventory with given id does not exist', async () => {
      expect.assertions(1);

      const { id } = inventoryEntityTestFactory.create();

      const { email, password } = userEntityTestFactory.create();

      const { user } = await userService.createUser({ email: email as string, password });

      const accessToken = await authService.getUserToken({ email: email as string, password });

      await customerService.createCustomer({ userId: user.id }, accessToken);

      const response = await httpService.sendRequest({
        endpoint: `${baseUrl}/${id}`,
        method: HttpMethodName.delete,
        headers: { [HttpHeader.authorization]: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(HttpStatusCode.notFound);
    });

    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      const { id } = inventoryEntityTestFactory.create();

      const response = await httpService.sendRequest({
        endpoint: `${baseUrl}/${id}`,
        method: HttpMethodName.delete,
      });

      expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
    });

    it('accepts a request and returns no content when inventoryId corresponds to existing inventory', async () => {
      expect.assertions(1);

      const { title, isbn, releaseYear, language, format, price } = bookEntityTestFactory.create();

      const { quantity } = inventoryEntityTestFactory.create();

      const { email, password } = userEntityTestFactory.create();

      const { user } = await userService.createUser({ email: email as string, password });

      const accessToken = await authService.getUserToken({ email: email as string, password });

      await customerService.createCustomer({ userId: user.id }, accessToken);

      const { book } = await bookService.createBook(
        {
          title,
          isbn,
          releaseYear,
          language,
          format,
          price,
        },
        accessToken,
      );

      const { inventory } = await inventoryService.createInventory(
        {
          bookId: book.id,
          quantity,
        },
        accessToken,
      );

      const response = await httpService.sendRequest({
        endpoint: `${baseUrl}/${inventory.id}`,
        method: HttpMethodName.delete,
        headers: { [HttpHeader.authorization]: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(HttpStatusCode.noContent);
    });
  });
});
