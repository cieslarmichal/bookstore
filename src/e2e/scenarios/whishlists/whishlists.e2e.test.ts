import 'reflect-metadata';

import { BookEntityTestFactory } from '../../../application/modules/bookModule/tests/factories/bookEntityTestFactory/bookEntityTestFactory';
import { UserEntityTestFactory } from '../../../application/modules/userModule/tests/factories/userEntityTestFactory/userEntityTestFactory';
import { FindWhishlistEntriesResponseOkBody } from '../../../application/modules/whishlistModule/api/httpControllers/whishlistHttpController/schemas/findWhishlistEntriesSchema';
import { WhishlistEntryEntityTestFactory } from '../../../application/modules/whishlistModule/tests/factories/whishlistEntryEntityTestFactory/whishlistEntryEntityTestFactory';
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
import { UserService } from '../../services/userService/userService';
import { WhishlistService } from '../../services/whishlistService/whishlistService';

const baseUrl = '/whishlist-entries';

describe(`Whishlists e2e`, () => {
  const whishlistEntryEntityTestFactory = new WhishlistEntryEntityTestFactory();
  const userEntityTestFactory = new UserEntityTestFactory();
  const bookEntityTestFactory = new BookEntityTestFactory();

  const httpService = new HttpServiceFactoryImpl(
    new FetchClientImpl(),
    new LoggerServiceImpl(new LoggerClientFactoryImpl({ logLevel: LogLevel.error }).create()),
  ).create({ baseUrl: '127.0.0.1:3000/' });

  const userService = new UserService(httpService);
  const authService = new AuthService(httpService);
  const customerService = new CustomerService(httpService);
  const bookService = new BookService(httpService);
  const whishlistService = new WhishlistService(httpService);

  describe('Create whishlist entry', () => {
    it('returns bad request when not all required properties in body are provided', async () => {
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

      expect(response.statusCode).toBe(HttpStatusCode.badRequest);
    });

    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      const { email, password } = userEntityTestFactory.create();

      const { user } = await userService.createUser({ email: email as string, password });

      const accessToken = await authService.getUserToken({ email: email as string, password });

      const { customer } = await customerService.createCustomer({ userId: user.id }, accessToken);

      const { title, isbn, releaseYear, language, format, price } = bookEntityTestFactory.create();

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
          customerId: customer.id,
          bookId: book.id,
        },
      });

      expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
    });

    it('accepts a request and returns created when all required body properties are provided and book and customer with given id exist', async () => {
      expect.assertions(1);

      const { email, password } = userEntityTestFactory.create();

      const { user } = await userService.createUser({ email: email as string, password });

      const accessToken = await authService.getUserToken({ email: email as string, password });

      const { customer } = await customerService.createCustomer({ userId: user.id }, accessToken);

      const { title, isbn, releaseYear, language, format, price } = bookEntityTestFactory.create();

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
          customerId: customer.id,
          bookId: book.id,
        },
      });

      expect(response.statusCode).toBe(HttpStatusCode.created);
    });
  });

  describe('Find whishlist entries', () => {
    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      const response = await httpService.sendRequest({
        endpoint: baseUrl,
        method: HttpMethodName.get,
      });

      expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
    });

    it('accepts request and returns whishlist entries', async () => {
      expect.assertions(2);

      const { email, password } = userEntityTestFactory.create();

      const { user } = await userService.createUser({ email: email as string, password });

      const accessToken = await authService.getUserToken({ email: email as string, password });

      await customerService.createCustomer({ userId: user.id }, accessToken);

      const { title, isbn, releaseYear, language, format, price } = bookEntityTestFactory.create();

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

      const { whishlistEntry: createdWhishlistEntry } = await whishlistService.createWhishlist(
        {
          bookId: book.id,
        },
        accessToken,
      );

      const response = await httpService.sendRequest({
        endpoint: baseUrl,
        method: HttpMethodName.get,
        headers: { [HttpHeader.authorization]: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(HttpStatusCode.ok);
      expect(
        (response.body as FindWhishlistEntriesResponseOkBody).data.find(
          (whishlistEntry) => whishlistEntry.id === createdWhishlistEntry.id,
        ),
      ).toBeDefined();
    });
  });

  describe('Delete whishlist entry', () => {
    it('returns not found when whishlist entry with given id does not exist', async () => {
      expect.assertions(1);

      const { id } = whishlistEntryEntityTestFactory.create();

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

      const { email, password } = userEntityTestFactory.create();

      const { user } = await userService.createUser({ email: email as string, password });

      const accessToken = await authService.getUserToken({ email: email as string, password });

      await customerService.createCustomer({ userId: user.id }, accessToken);

      const { title, isbn, releaseYear, language, format, price } = bookEntityTestFactory.create();

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

      const { whishlistEntry } = await whishlistService.createWhishlist(
        {
          bookId: book.id,
        },
        accessToken,
      );

      const response = await httpService.sendRequest({
        endpoint: `${baseUrl}/${whishlistEntry.id}`,
        method: HttpMethodName.delete,
      });

      expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
    });

    it('accepts a request and returns no content id corresponds to existing whishlist entry', async () => {
      expect.assertions(1);

      const { email, password } = userEntityTestFactory.create();

      const { user } = await userService.createUser({ email: email as string, password });

      const accessToken = await authService.getUserToken({ email: email as string, password });

      await customerService.createCustomer({ userId: user.id }, accessToken);

      const { title, isbn, releaseYear, language, format, price } = bookEntityTestFactory.create();

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

      const { whishlistEntry } = await whishlistService.createWhishlist(
        {
          bookId: book.id,
        },
        accessToken,
      );

      const response = await httpService.sendRequest({
        endpoint: `${baseUrl}/${whishlistEntry.id}`,
        method: HttpMethodName.delete,
        headers: { [HttpHeader.authorization]: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(HttpStatusCode.noContent);
    });
  });
});
