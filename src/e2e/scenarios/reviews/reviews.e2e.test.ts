import 'reflect-metadata';

import { FindReviewsResponseOkBody } from '../../../application/modules/reviewModule/api/httpControllers/reviewHttpController/schemas/findReviewsSchema';
import { ReviewEntityTestFactory } from '../../../application/modules/reviewModule/tests/factories/reviewEntityTestFactory/reviewEntityTestFactory';
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
import { CustomerService } from '../../services/customerService/customerService';
import { ReviewService } from '../../services/reviewService/reviewService';
import { UserService } from '../../services/userService/userService';

const baseUrl = '/reviews';

describe(`ReviewController (${baseUrl})`, () => {
  const reviewEntityTestFactory = new ReviewEntityTestFactory();
  const userEntityTestFactory = new UserEntityTestFactory();

  const httpService = new HttpServiceFactoryImpl(
    new FetchClientImpl(),
    new LoggerServiceImpl(new LoggerClientFactoryImpl({ logLevel: LogLevel.error }).create()),
  ).create({ baseUrl: '127.0.0.1:3000/' });

  const userService = new UserService(httpService);
  const authService = new AuthService(httpService);
  const customerService = new CustomerService(httpService);
  const reviewService = new ReviewService(httpService);

  describe('Create review', () => {
    it('returns bad request when not all required properties in body are provided', async () => {
      expect.assertions(1);

      const { isbn } = reviewEntityTestFactory.create();

      const { email, password } = userEntityTestFactory.create();

      const { user } = await userService.createUser({ email: email as string, password });

      const accessToken = await authService.getUserToken({ email: email as string, password });

      await customerService.createCustomer({ userId: user.id }, accessToken);

      const response = await httpService.sendRequest({
        endpoint: baseUrl,
        method: HttpMethodName.post,
        headers: { [HttpHeader.authorization]: `Bearer ${accessToken}` },
        body: {
          isbn,
        },
      });

      expect(response.statusCode).toBe(HttpStatusCode.badRequest);
    });

    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      const { isbn, rate, comment } = reviewEntityTestFactory.create();

      const { email, password } = userEntityTestFactory.create();

      const { user } = await userService.createUser({ email: email as string, password });

      const accessToken = await authService.getUserToken({ email: email as string, password });

      await customerService.createCustomer({ userId: user.id }, accessToken);

      const response = await httpService.sendRequest({
        endpoint: baseUrl,
        method: HttpMethodName.post,
        body: {
          isbn,
          rate,
          comment,
        },
      });

      expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
    });

    it('accepts a request and returns created when all required body properties', async () => {
      expect.assertions(1);

      const { isbn, rate, comment } = reviewEntityTestFactory.create();

      const { email, password } = userEntityTestFactory.create();

      const { user } = await userService.createUser({ email: email as string, password });

      const accessToken = await authService.getUserToken({ email: email as string, password });

      await customerService.createCustomer({ userId: user.id }, accessToken);

      const response = await httpService.sendRequest({
        endpoint: baseUrl,
        method: HttpMethodName.post,
        headers: { [HttpHeader.authorization]: `Bearer ${accessToken}` },
        body: {
          isbn,
          rate,
          comment,
        },
      });

      expect(response.statusCode).toBe(HttpStatusCode.created);
    });
  });

  describe('Find review', () => {
    it('returns not found when review with given reviewId does not exist', async () => {
      expect.assertions(1);

      const { id } = reviewEntityTestFactory.create();

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

      const { isbn, rate, comment } = reviewEntityTestFactory.create();

      const { email, password } = userEntityTestFactory.create();

      const { user } = await userService.createUser({ email: email as string, password });

      const accessToken = await authService.getUserToken({ email: email as string, password });

      await customerService.createCustomer({ userId: user.id }, accessToken);

      const { review } = await reviewService.createReview(
        {
          isbn,
          rate,
          comment: comment as string,
        },
        accessToken,
      );

      const response = await httpService.sendRequest({
        endpoint: `${baseUrl}/${review.id}`,
        method: HttpMethodName.get,
      });

      expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
    });

    it('accepts a request and returns ok when reviewId is uuid and have corresponding review', async () => {
      expect.assertions(1);

      const { isbn, rate, comment } = reviewEntityTestFactory.create();

      const { email, password } = userEntityTestFactory.create();

      const { user } = await userService.createUser({ email: email as string, password });

      const accessToken = await authService.getUserToken({ email: email as string, password });

      await customerService.createCustomer({ userId: user.id }, accessToken);

      const { review } = await reviewService.createReview(
        {
          isbn,
          rate,
          comment: comment as string,
        },
        accessToken,
      );

      const response = await httpService.sendRequest({
        endpoint: `${baseUrl}/${review.id}`,
        method: HttpMethodName.get,
        headers: { [HttpHeader.authorization]: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(HttpStatusCode.ok);
    });
  });

  describe('Find reviews', () => {
    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      const response = await httpService.sendRequest({
        endpoint: baseUrl,
        method: HttpMethodName.get,
      });

      expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
    });

    it('accepts request and returns reviews', async () => {
      expect.assertions(2);

      const { isbn, rate, comment } = reviewEntityTestFactory.create();

      const { email, password } = userEntityTestFactory.create();

      const { user } = await userService.createUser({ email: email as string, password });

      const accessToken = await authService.getUserToken({ email: email as string, password });

      const { customer } = await customerService.createCustomer({ userId: user.id }, accessToken);

      const { review } = await reviewService.createReview(
        {
          isbn,
          rate,
          comment: comment as string,
        },
        accessToken,
      );

      const response = await httpService.sendRequest({
        endpoint: `${baseUrl}?customerId=${customer.id}`,
        method: HttpMethodName.get,
        headers: { [HttpHeader.authorization]: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(HttpStatusCode.ok);
      expect(
        (response.body as FindReviewsResponseOkBody).data.find((responseReview) => responseReview.id === review.id),
      ).toBeDefined();
    });
  });

  describe('Update review', () => {
    it('returns not found when review with given reviewId does not exist', async () => {
      expect.assertions(1);

      const { id, rate } = reviewEntityTestFactory.create();

      const { email, password } = userEntityTestFactory.create();

      const { user } = await userService.createUser({ email: email as string, password });

      const accessToken = await authService.getUserToken({ email: email as string, password });

      await customerService.createCustomer({ userId: user.id }, accessToken);

      const response = await httpService.sendRequest({
        endpoint: `${baseUrl}/${id}`,
        method: HttpMethodName.patch,
        headers: { [HttpHeader.authorization]: `Bearer ${accessToken}` },
        body: {
          rate,
        },
      });

      expect(response.statusCode).toBe(HttpStatusCode.notFound);
    });

    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      const { isbn, rate, comment } = reviewEntityTestFactory.create();

      const { rate: updatedRate } = reviewEntityTestFactory.create();

      const { email, password } = userEntityTestFactory.create();

      const { user } = await userService.createUser({ email: email as string, password });

      const accessToken = await authService.getUserToken({ email: email as string, password });

      await customerService.createCustomer({ userId: user.id }, accessToken);

      const { review } = await reviewService.createReview(
        {
          isbn,
          rate,
          comment: comment as string,
        },
        accessToken,
      );

      const response = await httpService.sendRequest({
        endpoint: `${baseUrl}/${review.id}`,
        method: HttpMethodName.patch,
        body: {
          price: updatedRate,
        },
      });

      expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
    });

    it('accepts a request and returns ok when reviewId is uuid and corresponds to existing review', async () => {
      expect.assertions(1);

      const { isbn, rate, comment } = reviewEntityTestFactory.create();

      const { rate: updatedRate } = reviewEntityTestFactory.create();

      const { email, password } = userEntityTestFactory.create();

      const { user } = await userService.createUser({ email: email as string, password });

      const accessToken = await authService.getUserToken({ email: email as string, password });

      await customerService.createCustomer({ userId: user.id }, accessToken);

      const { review } = await reviewService.createReview(
        {
          isbn,
          rate,
          comment: comment as string,
        },
        accessToken,
      );

      const response = await httpService.sendRequest({
        endpoint: `${baseUrl}/${review.id}`,
        method: HttpMethodName.patch,
        headers: { [HttpHeader.authorization]: `Bearer ${accessToken}` },
        body: {
          price: updatedRate,
        },
      });

      expect(response.statusCode).toBe(HttpStatusCode.ok);
    });
  });

  describe('Delete review', () => {
    it('returns not found when review with given reviewId does not exist', async () => {
      expect.assertions(1);

      const { id } = reviewEntityTestFactory.create();

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

      const { isbn, rate, comment } = reviewEntityTestFactory.create();

      const { email, password } = userEntityTestFactory.create();

      const { user } = await userService.createUser({ email: email as string, password });

      const accessToken = await authService.getUserToken({ email: email as string, password });

      await customerService.createCustomer({ userId: user.id }, accessToken);

      const { review } = await reviewService.createReview(
        {
          isbn,
          rate,
          comment: comment as string,
        },
        accessToken,
      );

      const response = await httpService.sendRequest({
        endpoint: `${baseUrl}/${review.id}`,
        method: HttpMethodName.delete,
      });

      expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
    });

    it('accepts a request and returns no content when reviewId is uuid and corresponds to existing review', async () => {
      expect.assertions(1);

      const { isbn, rate, comment } = reviewEntityTestFactory.create();

      const { email, password } = userEntityTestFactory.create();

      const { user } = await userService.createUser({ email: email as string, password });

      const accessToken = await authService.getUserToken({ email: email as string, password });

      await customerService.createCustomer({ userId: user.id }, accessToken);

      const { review } = await reviewService.createReview(
        {
          isbn,
          rate,
          comment: comment as string,
        },
        accessToken,
      );

      const response = await httpService.sendRequest({
        endpoint: `${baseUrl}/${review.id}`,
        method: HttpMethodName.delete,
        headers: { [HttpHeader.authorization]: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(HttpStatusCode.noContent);
    });
  });
});
