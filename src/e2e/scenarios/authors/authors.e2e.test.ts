import 'reflect-metadata';

import { FindAuthorsResponseOkBody } from '../../../application/modules/authorModule/api/httpControllers/authorHttpController/schemas/findAuthorsSchema';
import { AuthorEntityTestFactory } from '../../../application/modules/authorModule/tests/factories/authorEntityTestFactory/authorEntityTestFactory';
import { UserEntityTestFactory } from '../../../application/modules/userModule/tests/factories/userEntityTestFactory/userEntityTestFactory';
import { HttpHeader } from '../../../common/http/httpHeader';
import { HttpMethodName } from '../../../common/http/httpMethodName';
import { HttpStatusCode } from '../../../common/http/httpStatusCode';
import { FetchClientImpl } from '../../../libs/http/clients/fetchClient/fetchClientImpl';
import { HttpServiceFactoryImpl } from '../../../libs/http/factories/httpServiceFactory/httpServiceFactoryImpl';
import { LoggerClientFactoryImpl } from '../../../libs/logger/factories/loggerClientFactory/loggerClientFactoryImpl';
import { LogLevel } from '../../../libs/logger/logLevel';
import { LoggerServiceImpl } from '../../../libs/logger/services/loggerService/loggerServiceImpl';
import { AuthorService } from '../../services/authorService/authorService';
import { AuthService } from '../../services/authService/authService';
import { CustomerService } from '../../services/customerService/customerService';
import { UserService } from '../../services/userService/userService';

const baseUrl = '/authors';

describe(`Authors e2e`, () => {
  const authorEntityTestFactory = new AuthorEntityTestFactory();
  const userEntityTestFactory = new UserEntityTestFactory();

  const httpService = new HttpServiceFactoryImpl(
    new FetchClientImpl(),
    new LoggerServiceImpl(new LoggerClientFactoryImpl({ logLevel: LogLevel.error }).create()),
  ).create({ baseUrl: 'http://127.0.0.1:3000' });

  const userService = new UserService(httpService);
  const authService = new AuthService(httpService);
  const customerService = new CustomerService(httpService);
  const authorService = new AuthorService(httpService);

  describe('Create author', () => {
    it('returns bad request when not all required properties in body are provided', async () => {
      expect.assertions(1);

      const { email, password } = userEntityTestFactory.create();

      const { firstName } = authorEntityTestFactory.create();

      const { user } = await userService.createUser({ email: email as string, password });

      const accessToken = await authService.getUserToken({ email: email as string, password });

      await customerService.createCustomer({ userId: user.id }, accessToken);

      const response = await httpService.sendRequest({
        endpoint: baseUrl,
        method: HttpMethodName.post,
        headers: { [HttpHeader.authorization]: `Bearer ${accessToken}` },
        body: {
          firstName,
        },
      });

      expect(response.statusCode).toBe(HttpStatusCode.badRequest);
    });

    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      const { firstName, lastName } = authorEntityTestFactory.create();

      const response = await httpService.sendRequest({
        endpoint: baseUrl,
        method: HttpMethodName.post,
        body: {
          firstName,
          lastName,
        },
      });

      expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
    });

    it('accepts a request and returns created when all required body properties are provided', async () => {
      expect.assertions(1);

      const { email, password } = userEntityTestFactory.create();

      const { firstName, lastName } = authorEntityTestFactory.create();

      const { user } = await userService.createUser({ email: email as string, password });

      const accessToken = await authService.getUserToken({ email: email as string, password });

      await customerService.createCustomer({ userId: user.id }, accessToken);

      const response = await httpService.sendRequest({
        endpoint: baseUrl,
        method: HttpMethodName.post,
        headers: { [HttpHeader.authorization]: `Bearer ${accessToken}` },
        body: {
          firstName,
          lastName,
        },
      });

      expect(response.statusCode).toBe(HttpStatusCode.created);
    });
  });

  describe('Find author', () => {
    it('returns not found when author with given authorId does not exist', async () => {
      expect.assertions(1);

      const { id: authorId } = authorEntityTestFactory.create();

      const { email, password } = userEntityTestFactory.create();

      const { user } = await userService.createUser({ email: email as string, password });

      const accessToken = await authService.getUserToken({ email: email as string, password });

      await customerService.createCustomer({ userId: user.id }, accessToken);

      const response = await httpService.sendRequest({
        endpoint: `${baseUrl}/${authorId}`,
        method: HttpMethodName.get,
        headers: { [HttpHeader.authorization]: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(HttpStatusCode.notFound);
    });

    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      const { firstName, lastName, about } = authorEntityTestFactory.create();

      const { email, password } = userEntityTestFactory.create();

      await userService.createUser({ email: email as string, password });

      const accessToken = await authService.getUserToken({ email: email as string, password });

      const { author } = await authorService.createAuthor(
        { firstName, lastName, about: about || undefined },
        accessToken,
      );

      const response = await httpService.sendRequest({
        endpoint: `${baseUrl}/${author.id}`,
        method: HttpMethodName.get,
      });

      expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
    });

    it('accepts a request and returns ok when authorId is uuid and have corresponding author', async () => {
      expect.assertions(1);

      const { email, password } = userEntityTestFactory.create();

      const { firstName, lastName, about } = authorEntityTestFactory.create();

      const { user } = await userService.createUser({ email: email as string, password });

      const accessToken = await authService.getUserToken({ email: email as string, password });

      await customerService.createCustomer({ userId: user.id }, accessToken);

      const { author } = await authorService.createAuthor(
        { firstName, lastName, about: about || undefined },
        accessToken,
      );

      const response = await httpService.sendRequest({
        endpoint: `${baseUrl}/${author.id}`,
        method: HttpMethodName.get,
        headers: { [HttpHeader.authorization]: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(HttpStatusCode.ok);
    });
  });

  describe('Find authors', () => {
    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      const response = await httpService.sendRequest({
        endpoint: baseUrl,
        method: HttpMethodName.get,
      });

      expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
    });

    it('returns authors with filtering provided', async () => {
      expect.assertions(2);

      const authorEntity1 = authorEntityTestFactory.create();

      const authorEntity2 = authorEntityTestFactory.create();

      const { email, password } = userEntityTestFactory.create();

      const { user } = await userService.createUser({ email: email as string, password });

      const accessToken = await authService.getUserToken({ email: email as string, password });

      await customerService.createCustomer({ userId: user.id }, accessToken);

      const { author } = await authorService.createAuthor(
        {
          firstName: authorEntity1.firstName,
          lastName: authorEntity1.lastName,
          about: authorEntity1.about as string,
        },
        accessToken,
      );

      await authorService.createAuthor(
        {
          firstName: authorEntity2.firstName,
          lastName: authorEntity2.lastName,
          about: authorEntity2.about as string,
        },
        accessToken,
      );

      const response = await httpService.sendRequest({
        endpoint: `${baseUrl}?filter=["firstName||eq||${authorEntity1.firstName}"]`,
        method: HttpMethodName.get,
        headers: { [HttpHeader.authorization]: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(HttpStatusCode.ok);
      expect(
        (response.body as FindAuthorsResponseOkBody).data.find((responseAuthor) => responseAuthor.id === author.id),
      ).toBeTruthy();
    });
  });

  describe('Update author', () => {
    it('returns bad request when provided not allowed properties in body', async () => {
      expect.assertions(1);

      const { email, password } = userEntityTestFactory.create();

      const { firstName, lastName, about } = authorEntityTestFactory.create();

      const { user } = await userService.createUser({ email: email as string, password });

      const accessToken = await authService.getUserToken({ email: email as string, password });

      await customerService.createCustomer({ userId: user.id }, accessToken);

      const { author } = await authorService.createAuthor(
        { firstName, lastName, about: about || undefined },
        accessToken,
      );

      const response = await httpService.sendRequest({
        endpoint: `${baseUrl}/${author.id}`,
        method: HttpMethodName.patch,
        headers: { [HttpHeader.authorization]: `Bearer ${accessToken}` },
        body: {
          firstName,
        },
      });

      expect(response.statusCode).toBe(HttpStatusCode.badRequest);
    });

    it('returns not found when author with given authorId does not exist', async () => {
      expect.assertions(1);

      const { email, password } = userEntityTestFactory.create();

      const { id: authorId, about } = authorEntityTestFactory.create();

      const { user } = await userService.createUser({ email: email as string, password });

      const accessToken = await authService.getUserToken({ email: email as string, password });

      await customerService.createCustomer({ userId: user.id }, accessToken);

      const response = await httpService.sendRequest({
        endpoint: `${baseUrl}/${authorId}`,
        method: HttpMethodName.patch,
        headers: { [HttpHeader.authorization]: `Bearer ${accessToken}` },
        body: {
          about,
        },
      });

      expect(response.statusCode).toBe(HttpStatusCode.notFound);
    });

    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      const { email, password } = userEntityTestFactory.create();

      await userService.createUser({ email: email as string, password });

      const accessToken = await authService.getUserToken({ email: email as string, password });

      const { firstName, lastName, about } = authorEntityTestFactory.create();

      const { author } = await authorService.createAuthor(
        { firstName, lastName, about: about || undefined },
        accessToken,
      );

      const response = await httpService.sendRequest({
        endpoint: `${baseUrl}/${author.id}`,
        method: HttpMethodName.patch,
        body: {
          about,
        },
      });

      expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
    });

    it('accepts a request and returns ok when authorId is uuid and corresponds to existing author', async () => {
      expect.assertions(1);

      const { email, password } = userEntityTestFactory.create();

      const { firstName, lastName, about } = authorEntityTestFactory.create();

      const { user } = await userService.createUser({ email: email as string, password });

      const accessToken = await authService.getUserToken({ email: email as string, password });

      await customerService.createCustomer({ userId: user.id }, accessToken);

      const { author } = await authorService.createAuthor(
        { firstName, lastName, about: about || undefined },
        accessToken,
      );

      const response = await httpService.sendRequest({
        endpoint: `${baseUrl}/${author.id}`,
        method: HttpMethodName.patch,
        headers: { [HttpHeader.authorization]: `Bearer ${accessToken}` },
        body: {
          about,
        },
      });

      expect(response.statusCode).toBe(HttpStatusCode.ok);
    });
  });

  describe('Delete author', () => {
    it('returns not found when author with given authorId does not exist', async () => {
      expect.assertions(1);

      const { email, password } = userEntityTestFactory.create();

      const { id: authorId } = authorEntityTestFactory.create();

      const { user } = await userService.createUser({ email: email as string, password });

      const accessToken = await authService.getUserToken({ email: email as string, password });

      await customerService.createCustomer({ userId: user.id }, accessToken);

      const response = await httpService.sendRequest({
        endpoint: `${baseUrl}/${authorId}`,
        method: HttpMethodName.delete,
        headers: { [HttpHeader.authorization]: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(HttpStatusCode.notFound);
    });

    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      const { email, password } = userEntityTestFactory.create();

      await userService.createUser({ email: email as string, password });

      const accessToken = await authService.getUserToken({ email: email as string, password });

      const { firstName, lastName, about } = authorEntityTestFactory.create();

      const { author } = await authorService.createAuthor(
        { firstName, lastName, about: about || undefined },
        accessToken,
      );

      const response = await httpService.sendRequest({
        endpoint: `${baseUrl}/${author.id}`,
        method: HttpMethodName.delete,
      });

      expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
    });

    it('accepts a request and returns no content when authorId is uuid and corresponds to existing author', async () => {
      expect.assertions(1);

      const { email, password } = userEntityTestFactory.create();

      const { firstName, lastName, about } = authorEntityTestFactory.create();

      const { user } = await userService.createUser({ email: email as string, password });

      const accessToken = await authService.getUserToken({ email: email as string, password });

      await customerService.createCustomer({ userId: user.id }, accessToken);

      const { author } = await authorService.createAuthor(
        { firstName, lastName, about: about || undefined },
        accessToken,
      );

      const response = await httpService.sendRequest({
        endpoint: `${baseUrl}/${author.id}`,
        method: HttpMethodName.delete,
        headers: { [HttpHeader.authorization]: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(HttpStatusCode.noContent);
    });
  });
});
