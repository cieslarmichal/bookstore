import 'reflect-metadata';

import { BookCategoryEntityTestFactory } from '../../../application/modules/bookCategoryModule/tests/factories/bookCategoryEntityTestFactory/bookCategoryEntityTestFactory';
import { BookEntityTestFactory } from '../../../application/modules/bookModule/tests/factories/bookEntityTestFactory/bookEntityTestFactory';
import { CategoryEntityTestFactory } from '../../../application/modules/categoryModule/tests/factories/categoryEntityTestFactory/categoryEntityTestFactory';
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
import { AuthService } from '../../services/authService/authService';
import { BookCategoryService } from '../../services/bookCategoryService/bookCategoryService';
import { BookService } from '../../services/bookService/bookService';
import { CategoryService } from '../../services/categoryService/categoryService';
import { CustomerService } from '../../services/customerService/customerService';
import { UserService } from '../../services/userService/userService';

describe(`Book categories e2e`, () => {
  const bookCategoryEntityTestFactory = new BookCategoryEntityTestFactory();
  const categoryEntityTestFactory = new CategoryEntityTestFactory();
  const bookEntityTestFactory = new BookEntityTestFactory();
  const userEntityTestFactory = new UserEntityTestFactory();

  const httpService = new HttpServiceFactoryImpl(
    new FetchClientImpl(),
    new LoggerServiceImpl(new LoggerClientFactoryImpl({ logLevel: LogLevel.error }).create()),
  ).create({ baseUrl: 'http://127.0.0.1:3000' });

  const userService = new UserService(httpService);
  const authService = new AuthService(httpService);
  const customerService = new CustomerService(httpService);
  const bookService = new BookService(httpService);
  const categoryService = new CategoryService(httpService);
  const bookCategoryService = new BookCategoryService(httpService);

  describe('Create bookCategory', () => {
    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      const { categoryId, bookId } = bookCategoryEntityTestFactory.create();

      const response = await httpService.sendRequest({
        endpoint: `/books/${bookId}/categories/${categoryId}`,
        method: HttpMethodName.post,
      });

      expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
    });

    it('returns not found when category or book corresponding to categoryId and bookId does not exist', async () => {
      expect.assertions(1);

      const { categoryId, bookId } = bookCategoryEntityTestFactory.create();

      const { email, password } = userEntityTestFactory.create();

      const { user } = await userService.createUser({ email: email as string, password });

      const accessToken = await authService.getUserToken({ email: email as string, password });

      await customerService.createCustomer({ userId: user.id }, accessToken);

      const response = await httpService.sendRequest({
        endpoint: `/books/${bookId}/categories/${categoryId}`,
        method: HttpMethodName.post,
        headers: { [HttpHeader.authorization]: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(HttpStatusCode.notFound);
    });

    it('returns created when all required params are provided', async () => {
      expect.assertions(1);

      const bookEntity = bookEntityTestFactory.create();

      const categoryEntity = categoryEntityTestFactory.create();

      const { email, password } = userEntityTestFactory.create();

      const { user } = await userService.createUser({ email: email as string, password });

      const accessToken = await authService.getUserToken({ email: email as string, password });

      await customerService.createCustomer({ userId: user.id }, accessToken);

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

      const { category } = await categoryService.createCategory(categoryEntity, accessToken);

      const response = await httpService.sendRequest({
        endpoint: `/books/${book.id}/categories/${category.id}`,
        method: HttpMethodName.post,
        headers: { [HttpHeader.authorization]: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(HttpStatusCode.created);
    });
  });

  describe('Delete bookCategory', () => {
    it('returns not found when bookCategory with categoryId and bookId does not exist', async () => {
      expect.assertions(1);

      const { categoryId, bookId } = bookCategoryEntityTestFactory.create();

      const { email, password } = userEntityTestFactory.create();

      await userService.createUser({ email: email as string, password });

      const accessToken = await authService.getUserToken({ email: email as string, password });

      const response = await httpService.sendRequest({
        endpoint: `/books/${bookId}/categories/${categoryId}`,
        method: HttpMethodName.delete,
        headers: { [HttpHeader.authorization]: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(HttpStatusCode.notFound);
    });

    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      const bookEntity = bookEntityTestFactory.create();

      const categoryEntity = categoryEntityTestFactory.create();

      const { email, password } = userEntityTestFactory.create();

      const { user } = await userService.createUser({ email: email as string, password });

      const accessToken = await authService.getUserToken({ email: email as string, password });

      await customerService.createCustomer({ userId: user.id }, accessToken);

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

      const { category } = await categoryService.createCategory(categoryEntity, accessToken);

      const response = await httpService.sendRequest({
        endpoint: `/books/${book.id}/categories/${category.id}`,
        method: HttpMethodName.delete,
      });

      expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
    });

    it('accepts a request and returns no content when bookCategoryId is uuid and corresponds to existing bookCategory', async () => {
      expect.assertions(1);

      const bookEntity = bookEntityTestFactory.create();

      const categoryEntity = categoryEntityTestFactory.create();

      const { email, password } = userEntityTestFactory.create();

      const { user } = await userService.createUser({ email: email as string, password });

      const accessToken = await authService.getUserToken({ email: email as string, password });

      await customerService.createCustomer({ userId: user.id }, accessToken);

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

      const { category } = await categoryService.createCategory(categoryEntity, accessToken);

      await bookCategoryService.createBookCategory(book.id, category.id, accessToken);

      const response = await httpService.sendRequest({
        endpoint: `/books/${book.id}/categories/${category.id}`,
        method: HttpMethodName.delete,
        headers: { [HttpHeader.authorization]: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(HttpStatusCode.noContent);
    });
  });
});
