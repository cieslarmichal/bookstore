import 'reflect-metadata';

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
import { UserService } from '../../services/userService/userService';

const baseUrl = '/users';
const registerUrl = `${baseUrl}/register`;
const loginUrl = `${baseUrl}/login`;
const setPasswordUrl = `${baseUrl}/set-password`;
const setEmailUrl = `${baseUrl}/set-email`;
const setPhoneNumberUrl = `${baseUrl}/set-phone-number`;

describe(`Users e2e`, () => {
  const userEntityTestFactory = new UserEntityTestFactory();

  const httpService = new HttpServiceFactoryImpl(
    new FetchClientImpl(),
    new LoggerServiceImpl(new LoggerClientFactoryImpl({ logLevel: LogLevel.error }).create()),
  ).create({ baseUrl: 'http://127.0.0.1:3000' });

  const userService = new UserService(httpService);
  const authService = new AuthService(httpService);

  describe('Register user by email', () => {
    it('returns bad request when not all required properties in body are provided', async () => {
      expect.assertions(1);

      const { email } = userEntityTestFactory.create();

      const response = await httpService.sendRequest({
        endpoint: registerUrl,
        method: HttpMethodName.post,
        body: { email },
      });

      expect(response.statusCode).toBe(HttpStatusCode.badRequest);
    });

    it('returns unprocessable entity when user with given email already exists', async () => {
      expect.assertions(1);

      const { email, password } = userEntityTestFactory.create();

      await userService.createUser({ email: email as string, password });

      const response = await httpService.sendRequest({
        endpoint: registerUrl,
        method: HttpMethodName.post,
        body: {
          email,
          password,
        },
      });

      expect(response.statusCode).toBe(HttpStatusCode.unprocessableEntity);
    });

    it('returns created when all required body properties are provided', async () => {
      expect.assertions(1);

      const { email, password } = userEntityTestFactory.create();

      const response = await httpService.sendRequest({
        endpoint: registerUrl,
        method: HttpMethodName.post,
        body: {
          email,
          password,
        },
      });

      expect(response.statusCode).toBe(HttpStatusCode.created);
    });
  });

  describe('Register user by phone number', () => {
    it('returns bad request when not all required properties in body are provided', async () => {
      expect.assertions(1);

      const { phoneNumber } = userEntityTestFactory.create();

      const response = await httpService.sendRequest({
        endpoint: registerUrl,
        method: HttpMethodName.post,
        body: {
          phoneNumber,
        },
      });

      expect(response.statusCode).toBe(HttpStatusCode.badRequest);
    });

    it('returns unprocessable entity when user with given phone number already exists', async () => {
      expect.assertions(1);

      const { phoneNumber, password } = userEntityTestFactory.create();

      await userService.createUser({ phoneNumber: phoneNumber as string, password });

      const response = await httpService.sendRequest({
        endpoint: registerUrl,
        method: HttpMethodName.post,
        body: {
          phoneNumber,
          password,
        },
      });

      expect(response.statusCode).toBe(HttpStatusCode.unprocessableEntity);
    });

    it('returns created when all required body properties are provided', async () => {
      expect.assertions(1);

      const { phoneNumber, password } = userEntityTestFactory.create();

      const response = await httpService.sendRequest({
        endpoint: registerUrl,
        method: HttpMethodName.post,
        body: {
          phoneNumber,
          password,
        },
      });

      expect(response.statusCode).toBe(HttpStatusCode.created);
    });
  });

  describe('Login user by email', () => {
    it('returns bad request when not all required properties in body are provided', async () => {
      expect.assertions(1);

      const { email } = userEntityTestFactory.create();

      const response = await httpService.sendRequest({
        endpoint: loginUrl,
        method: HttpMethodName.post,
        body: {
          email,
        },
      });

      expect(response.statusCode).toBe(HttpStatusCode.badRequest);
    });

    it('returns not found when user with given email does not exist', async () => {
      expect.assertions(1);

      const { email, password } = userEntityTestFactory.create();

      const response = await httpService.sendRequest({
        endpoint: loginUrl,
        method: HttpMethodName.post,
        body: {
          email,
          password,
        },
      });

      expect(response.statusCode).toBe(HttpStatusCode.notFound);
    });

    it('returns ok when existing credentials are provided', async () => {
      expect.assertions(1);

      const { email, password } = userEntityTestFactory.create();

      await userService.createUser({ email: email as string, password });

      const response = await httpService.sendRequest({
        endpoint: loginUrl,
        method: HttpMethodName.post,
        body: {
          email,
          password,
        },
      });

      expect(response.statusCode).toBe(HttpStatusCode.ok);
    });
  });

  describe('Login user by phone number', () => {
    it('returns bad request when not all required properties in body are provided', async () => {
      expect.assertions(1);

      const { phoneNumber } = userEntityTestFactory.create();

      const response = await httpService.sendRequest({
        endpoint: loginUrl,
        method: HttpMethodName.post,
        body: {
          phoneNumber,
        },
      });

      expect(response.statusCode).toBe(HttpStatusCode.badRequest);
    });

    it('returns not found when user with given phone number does not exist', async () => {
      expect.assertions(1);

      const { phoneNumber, password } = userEntityTestFactory.create();

      const response = await httpService.sendRequest({
        endpoint: loginUrl,
        method: HttpMethodName.post,
        body: {
          phoneNumber,
          password,
        },
      });

      expect(response.statusCode).toBe(HttpStatusCode.notFound);
    });

    it('returns ok when existing credentials are provided', async () => {
      expect.assertions(1);

      const { phoneNumber, password } = userEntityTestFactory.create();

      await userService.createUser({ phoneNumber: phoneNumber as string, password });

      const response = await httpService.sendRequest({
        endpoint: loginUrl,
        method: HttpMethodName.post,
        body: {
          phoneNumber,
          password,
        },
      });

      expect(response.statusCode).toBe(HttpStatusCode.ok);
    });
  });

  describe('Set password', () => {
    it('returns bad request when not all required properties in body are provided', async () => {
      expect.assertions(1);

      const { email, password } = userEntityTestFactory.create();

      await userService.createUser({ email: email as string, password });

      const accessToken = await authService.getUserToken({ email: email as string, password });

      const response = await httpService.sendRequest({
        endpoint: setPasswordUrl,
        method: HttpMethodName.post,
        headers: { [HttpHeader.authorization]: `Bearer ${accessToken}` },
        body: {
          password,
        },
      });

      expect(response.statusCode).toBe(HttpStatusCode.badRequest);
    });

    it('returns not found when user with given id does not exist', async () => {
      expect.assertions(1);

      const { id: userId, email, password } = userEntityTestFactory.create();

      await userService.createUser({ email: email as string, password });

      const accessToken = await authService.getUserToken({ email: email as string, password });

      const response = await httpService.sendRequest({
        endpoint: setPasswordUrl,
        method: HttpMethodName.post,
        headers: { [HttpHeader.authorization]: `Bearer ${accessToken}` },
        body: {
          userId,
          password,
        },
      });

      expect(response.statusCode).toBe(HttpStatusCode.notFound);
    });

    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      const { id: userId, email, password } = userEntityTestFactory.create();

      await userService.createUser({ email: email as string, password });

      const response = await httpService.sendRequest({
        endpoint: setPasswordUrl,
        method: HttpMethodName.post,
        body: {
          userId,
          password,
        },
      });

      expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
    });

    it('returns forbidden when user id from access token does not match target user id', async () => {
      expect.assertions(1);

      const { email, password } = userEntityTestFactory.create();

      const { id: targetUserId } = userEntityTestFactory.create();

      await userService.createUser({ email: email as string, password });

      const accessToken = await authService.getUserToken({ email: email as string, password });

      const response = await httpService.sendRequest({
        endpoint: setPasswordUrl,
        method: HttpMethodName.post,
        headers: { [HttpHeader.authorization]: `Bearer ${accessToken}` },
        body: {
          userId: targetUserId,
          password,
        },
      });

      expect(response.statusCode).toBe(HttpStatusCode.forbidden);
    });

    it('returns no content when all required fields are provided and user with given id exists', async () => {
      expect.assertions(1);

      const { email, password } = userEntityTestFactory.create();

      const {
        user: { id: userId },
      } = await userService.createUser({ email: email as string, password });

      const accessToken = await authService.getUserToken({ email: email as string, password });

      const response = await httpService.sendRequest({
        endpoint: setPasswordUrl,
        method: HttpMethodName.post,
        headers: { [HttpHeader.authorization]: `Bearer ${accessToken}` },
        body: {
          userId,
          password,
        },
      });

      expect(response.statusCode).toBe(HttpStatusCode.noContent);
    });
  });

  describe('Set email', () => {
    it('returns bad request when not all required properties in body are provided', async () => {
      expect.assertions(1);

      const { phoneNumber, password, email } = userEntityTestFactory.create();

      await userService.createUser({ phoneNumber: phoneNumber as string, password });

      const accessToken = await authService.getUserToken({ phoneNumber: phoneNumber as string, password });

      const response = await httpService.sendRequest({
        endpoint: setEmailUrl,
        method: HttpMethodName.post,
        headers: { [HttpHeader.authorization]: `Bearer ${accessToken}` },
        body: {
          email,
        },
      });

      expect(response.statusCode).toBe(HttpStatusCode.badRequest);
    });

    it('returns not found when user with given id does not exist', async () => {
      expect.assertions(1);

      const { id: userId, phoneNumber, password, email } = userEntityTestFactory.create();

      await userService.createUser({ phoneNumber: phoneNumber as string, password });

      const accessToken = await authService.getUserToken({ phoneNumber: phoneNumber as string, password });

      const response = await httpService.sendRequest({
        endpoint: setEmailUrl,
        method: HttpMethodName.post,
        headers: { [HttpHeader.authorization]: `Bearer ${accessToken}` },
        body: {
          userId,
          email,
        },
      });

      expect(response.statusCode).toBe(HttpStatusCode.notFound);
    });

    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      const { id: userId, email } = userEntityTestFactory.create();

      const response = await httpService.sendRequest({
        endpoint: setEmailUrl,
        method: HttpMethodName.post,
        body: {
          userId,
          email,
        },
      });

      expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
    });

    it('returns forbidden when user id from access token does not match target user id', async () => {
      expect.assertions(1);

      const { phoneNumber, password, email } = userEntityTestFactory.create();

      const { id: targetUserId } = userEntityTestFactory.create();

      await userService.createUser({ phoneNumber: phoneNumber as string, password });

      const accessToken = await authService.getUserToken({ phoneNumber: phoneNumber as string, password });

      const response = await httpService.sendRequest({
        endpoint: setEmailUrl,
        method: HttpMethodName.post,
        headers: { [HttpHeader.authorization]: `Bearer ${accessToken}` },
        body: {
          userId: targetUserId,
          email,
        },
      });

      expect(response.statusCode).toBe(HttpStatusCode.forbidden);
    });

    it('returns unprocessable entity when email is already in use by other user', async () => {
      expect.assertions(1);

      const { email, password, phoneNumber } = userEntityTestFactory.create();

      const {
        user: { id: userId },
      } = await userService.createUser({ phoneNumber: phoneNumber as string, password });

      await userService.createUser({ email: email as string, password });

      const accessToken = await authService.getUserToken({ phoneNumber: phoneNumber as string, password });

      const response = await httpService.sendRequest({
        endpoint: setEmailUrl,
        method: HttpMethodName.post,
        headers: { [HttpHeader.authorization]: `Bearer ${accessToken}` },
        body: {
          userId,
          email,
        },
      });

      expect(response.statusCode).toBe(HttpStatusCode.unprocessableEntity);
    });

    it('returns no content when all required fields are provided and user with given id exists', async () => {
      expect.assertions(1);

      const { email, password, phoneNumber } = userEntityTestFactory.create();

      const {
        user: { id: userId },
      } = await userService.createUser({ phoneNumber: phoneNumber as string, password });

      const accessToken = await authService.getUserToken({ phoneNumber: phoneNumber as string, password });

      const response = await httpService.sendRequest({
        endpoint: setEmailUrl,
        method: HttpMethodName.post,
        headers: { [HttpHeader.authorization]: `Bearer ${accessToken}` },
        body: {
          userId,
          email,
        },
      });

      expect(response.statusCode).toBe(HttpStatusCode.noContent);
    });
  });

  describe('Set phone number', () => {
    it('returns bad request when not all required properties in body are provided', async () => {
      expect.assertions(1);

      const { email, password, phoneNumber } = userEntityTestFactory.create();

      await userService.createUser({ email: email as string, password });

      const accessToken = await authService.getUserToken({ email: email as string, password });

      const response = await httpService.sendRequest({
        endpoint: setPhoneNumberUrl,
        method: HttpMethodName.post,
        headers: { [HttpHeader.authorization]: `Bearer ${accessToken}` },
        body: {
          phoneNumber,
        },
      });

      expect(response.statusCode).toBe(HttpStatusCode.badRequest);
    });

    it('returns not found when user with given id does not exist', async () => {
      expect.assertions(1);

      const { id: userId, email, password, phoneNumber } = userEntityTestFactory.create();

      await userService.createUser({ email: email as string, password });

      const accessToken = await authService.getUserToken({ email: email as string, password });

      const response = await httpService.sendRequest({
        endpoint: setPhoneNumberUrl,
        method: HttpMethodName.post,
        headers: { [HttpHeader.authorization]: `Bearer ${accessToken}` },
        body: {
          userId,
          phoneNumber,
        },
      });

      expect(response.statusCode).toBe(HttpStatusCode.notFound);
    });

    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      const { email, password, phoneNumber } = userEntityTestFactory.create();

      const {
        user: { id: userId },
      } = await userService.createUser({ email: email as string, password });

      const response = await httpService.sendRequest({
        endpoint: setPhoneNumberUrl,
        method: HttpMethodName.post,
        body: {
          userId,
          phoneNumber,
        },
      });

      expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
    });

    it('returns forbidden when user id from access token does not match target user id', async () => {
      expect.assertions(1);

      const { email, password, phoneNumber, id: targetUserId } = userEntityTestFactory.create();

      await userService.createUser({ email: email as string, password });

      const accessToken = await authService.getUserToken({ email: email as string, password });

      const response = await httpService.sendRequest({
        endpoint: setPhoneNumberUrl,
        method: HttpMethodName.post,
        headers: { [HttpHeader.authorization]: `Bearer ${accessToken}` },
        body: {
          userId: targetUserId,
          phoneNumber,
        },
      });

      expect(response.statusCode).toBe(HttpStatusCode.forbidden);
    });

    it('returns unprocessable entity when phone number is already in use by other user', async () => {
      expect.assertions(1);

      const { phoneNumber, password, email } = userEntityTestFactory.create();

      await userService.createUser({ phoneNumber: phoneNumber as string, password });

      const { user } = await userService.createUser({ email: email as string, password });

      const accessToken = await authService.getUserToken({ email: email as string, password });

      const response = await httpService.sendRequest({
        endpoint: setPhoneNumberUrl,
        method: HttpMethodName.post,
        headers: { [HttpHeader.authorization]: `Bearer ${accessToken}` },
        body: {
          userId: user.id,
          phoneNumber,
        },
      });

      expect(response.statusCode).toBe(HttpStatusCode.unprocessableEntity);
    });

    it('returns no content when all required fields are provided and user with given id exists', async () => {
      expect.assertions(1);

      const { email, phoneNumber, password } = userEntityTestFactory.create();

      const { user } = await userService.createUser({ email: email as string, password });

      const accessToken = await authService.getUserToken({ email: email as string, password });

      const response = await httpService.sendRequest({
        endpoint: setPhoneNumberUrl,
        method: HttpMethodName.post,
        headers: { [HttpHeader.authorization]: `Bearer ${accessToken}` },
        body: {
          userId: user.id,
          phoneNumber,
        },
      });

      expect(response.statusCode).toBe(HttpStatusCode.noContent);
    });
  });

  describe('Find user', () => {
    it('returns not found when user with given userId does not exist', async () => {
      expect.assertions(1);

      const { id: userId } = userEntityTestFactory.create();

      const { email, password } = userEntityTestFactory.create();

      await userService.createUser({ email: email as string, password });

      const accessToken = await authService.getUserToken({ email: email as string, password });

      const response = await httpService.sendRequest({
        endpoint: `${baseUrl}/${userId}`,
        method: HttpMethodName.get,
        headers: { [HttpHeader.authorization]: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(HttpStatusCode.notFound);
    });

    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      const { id: userId } = userEntityTestFactory.create();

      const { email, password } = userEntityTestFactory.create();

      await userService.createUser({ email: email as string, password });

      const response = await httpService.sendRequest({
        endpoint: `${baseUrl}/${userId}`,
        method: HttpMethodName.get,
      });

      expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
    });

    it('returns forbidden when user id from access token does not match target user id', async () => {
      expect.assertions(1);

      const { id: userId } = userEntityTestFactory.create();

      const { email, password } = userEntityTestFactory.create();

      await userService.createUser({ email: email as string, password });

      const accessToken = await authService.getUserToken({ email: email as string, password });

      const response = await httpService.sendRequest({
        endpoint: `${baseUrl}/${userId}`,
        method: HttpMethodName.get,
        headers: { [HttpHeader.authorization]: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(HttpStatusCode.forbidden);
    });

    it('accepts a request and returns ok when userId is uuid and have corresponding user', async () => {
      expect.assertions(1);

      const { email, password } = userEntityTestFactory.create();

      const { user } = await userService.createUser({ email: email as string, password });

      const accessToken = await authService.getUserToken({ email: email as string, password });

      const response = await httpService.sendRequest({
        endpoint: `${baseUrl}/${user.id}`,
        method: HttpMethodName.get,
        headers: { [HttpHeader.authorization]: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(HttpStatusCode.ok);
    });
  });

  describe('Delete user', () => {
    it('returns not found when user with given userId does not exist', async () => {
      expect.assertions(1);

      const { id: userId } = userEntityTestFactory.create();

      const { email, password } = userEntityTestFactory.create();

      await userService.createUser({ email: email as string, password });

      const accessToken = await authService.getUserToken({ email: email as string, password });

      const response = await httpService.sendRequest({
        endpoint: `${baseUrl}/${userId}`,
        method: HttpMethodName.delete,
        headers: { [HttpHeader.authorization]: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(HttpStatusCode.notFound);
    });

    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      const { email, password } = userEntityTestFactory.create();

      const { user } = await userService.createUser({ email: email as string, password });

      const response = await httpService.sendRequest({
        endpoint: `${baseUrl}/${user.id}`,
        method: HttpMethodName.delete,
      });

      expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
    });

    it('returns forbidden when user id from access token does not match target user id', async () => {
      expect.assertions(1);

      const { id: targetUserId } = userEntityTestFactory.create();

      const { email, password } = userEntityTestFactory.create();

      await userService.createUser({ email: email as string, password });

      const accessToken = await authService.getUserToken({ email: email as string, password });

      const response = await httpService.sendRequest({
        endpoint: `${baseUrl}/${targetUserId}`,
        method: HttpMethodName.delete,
        headers: { [HttpHeader.authorization]: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(HttpStatusCode.forbidden);
    });

    it('accepts a request and returns no content when userId is uuid and corresponds to existing user', async () => {
      expect.assertions(1);

      const { email, password } = userEntityTestFactory.create();

      const { user } = await userService.createUser({ email: email as string, password });

      const accessToken = await authService.getUserToken({ email: email as string, password });

      const response = await httpService.sendRequest({
        endpoint: `${baseUrl}/${user.id}`,
        method: HttpMethodName.delete,
        headers: { [HttpHeader.authorization]: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(HttpStatusCode.noContent);
    });
  });
});
