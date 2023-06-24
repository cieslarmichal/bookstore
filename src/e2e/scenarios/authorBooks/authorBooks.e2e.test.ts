import 'reflect-metadata';

import { AuthorBookEntityTestFactory } from '../../../application/modules/authorBookModule/tests/factories/authorBookEntityTestFactory/authorBookEntityTestFactory';
import { AuthorEntityTestFactory } from '../../../application/modules/authorModule/tests/factories/authorEntityTestFactory/authorEntityTestFactory';
import { BookEntityTestFactory } from '../../../application/modules/bookModule/tests/factories/bookEntityTestFactory/bookEntityTestFactory';
import { UserEntityTestFactory } from '../../../application/modules/userModule/tests/factories/userEntityTestFactory/userEntityTestFactory';
import { HttpHeader } from '../../../common/http/httpHeader';
import { HttpMethodName } from '../../../common/http/httpMethodName';
import { HttpStatusCode } from '../../../common/http/httpStatusCode';
import { FetchClientImpl } from '../../../libs/http/clients/fetchClient/fetchClientImpl';
import { HttpServiceFactoryImpl } from '../../../libs/http/factories/httpServiceFactory/httpServiceFactoryImpl';
import { LoggerClientFactoryImpl } from '../../../libs/logger/factories/loggerClientFactory/loggerClientFactoryImpl';
import { LogLevel } from '../../../libs/logger/logLevel';
import { LoggerServiceImpl } from '../../../libs/logger/services/loggerService/loggerServiceImpl';
import { AuthorBookService } from '../../services/authorBookService/authorBookService';
import { AuthorService } from '../../services/authorService/authorService';
import { AuthService } from '../../services/authService/authService';
import { BookService } from '../../services/bookService/bookService';
import { CustomerService } from '../../services/customerService/customerService';
import { UserService } from '../../services/userService/userService';

describe(`Author books e2e`, () => {
  const authorBookEntityTestFactory = new AuthorBookEntityTestFactory();
  const authorEntityTestFactory = new AuthorEntityTestFactory();
  const bookEntityTestFactory = new BookEntityTestFactory();
  const userEntityTestFactory = new UserEntityTestFactory();

  const httpService = new HttpServiceFactoryImpl(
    new FetchClientImpl(),
    new LoggerServiceImpl(new LoggerClientFactoryImpl({ logLevel: LogLevel.error }).create()),
  ).create({ baseUrl: '/' });

  const userService = new UserService(httpService);
  const authService = new AuthService(httpService);
  const customerService = new CustomerService(httpService);
  const authorService = new AuthorService(httpService);
  const bookService = new BookService(httpService);
  const authorBookService = new AuthorBookService(httpService);

  describe('Create authorBook', () => {
    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      const { authorId, bookId } = authorBookEntityTestFactory.create();

      const response = await httpService.sendRequest({
        endpoint: `authors/${authorId}/books/${bookId}`,
        method: HttpMethodName.post,
      });

      expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
    });

    it('returns not found when author or book corresponding to authorId and bookId does not exist', async () => {
      expect.assertions(1);

      const { authorId, bookId } = authorBookEntityTestFactory.create();

      const { email, password } = userEntityTestFactory.create();

      const { user } = await userService.createUser({ email: email as string, password });

      const accessToken = await authService.getUserToken({ email: email as string, password });

      await customerService.createCustomer({ userId: user.id }, accessToken);

      const response = await httpService.sendRequest({
        endpoint: `authors/${authorId}/books/${bookId}`,
        method: HttpMethodName.post,
        headers: { [HttpHeader.authorization]: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(HttpStatusCode.notFound);
    });

    it('returns created when all required params are provided', async () => {
      expect.assertions(1);

      const { isbn, format, language, price, releaseYear, title } = bookEntityTestFactory.create();

      const { firstName, lastName } = authorEntityTestFactory.create();

      const { email, password } = userEntityTestFactory.create();

      const { user } = await userService.createUser({ email: email as string, password });

      const accessToken = await authService.getUserToken({ email: email as string, password });

      await customerService.createCustomer({ userId: user.id }, accessToken);

      const { book } = await bookService.createBook(
        {
          format,
          isbn,
          language,
          price,
          releaseYear,
          title,
        },
        accessToken,
      );

      const { author } = await authorService.createAuthor({ firstName, lastName }, accessToken);

      const response = await httpService.sendRequest({
        endpoint: `authors/${author.id}/books/${book.id}`,
        method: HttpMethodName.post,
        headers: { [HttpHeader.authorization]: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(HttpStatusCode.created);
    });
  });

  describe('Delete authorBook', () => {
    it('returns not found when authorBook with authorId and bookId does not exist', async () => {
      expect.assertions(1);

      const { authorId, bookId } = authorBookEntityTestFactory.create();

      const { email, password } = userEntityTestFactory.create();

      const { user } = await userService.createUser({ email: email as string, password });

      const accessToken = await authService.getUserToken({ email: email as string, password });

      await customerService.createCustomer({ userId: user.id }, accessToken);

      const response = await httpService.sendRequest({
        endpoint: `authors/${authorId}/books/${bookId}`,
        method: HttpMethodName.delete,
        headers: { [HttpHeader.authorization]: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(HttpStatusCode.notFound);
    });

    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      const { authorId, bookId } = authorBookEntityTestFactory.create();

      const response = await httpService.sendRequest({
        endpoint: `authors/${authorId}/books/${bookId}`,
        method: HttpMethodName.delete,
      });

      expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
    });

    it('accepts a request and returns no content when authorBookId is uuid and corresponds to existing authorBook', async () => {
      expect.assertions(1);

      const { isbn, format, language, price, releaseYear, title } = bookEntityTestFactory.create();

      const { firstName, lastName } = authorEntityTestFactory.create();

      const { email, password } = userEntityTestFactory.create();

      const { user } = await userService.createUser({ email: email as string, password });

      const accessToken = await authService.getUserToken({ email: email as string, password });

      await customerService.createCustomer({ userId: user.id }, accessToken);

      const { book } = await bookService.createBook(
        {
          format,
          isbn,
          language,
          price,
          releaseYear,
          title,
        },
        accessToken,
      );

      const { author } = await authorService.createAuthor({ firstName, lastName }, accessToken);

      await authorBookService.createAuthorBook(author.id, book.id, accessToken);

      const response = await httpService.sendRequest({
        endpoint: `authors/${author.id}/books/${book.id}`,
        method: HttpMethodName.delete,
      });

      expect(response.statusCode).toBe(HttpStatusCode.noContent);
    });
  });
});
