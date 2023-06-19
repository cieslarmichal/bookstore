import 'reflect-metadata';

import { FindAddressesResponseOkBody } from '../../../application/modules/addressModule/api/httpControllers/addressHttpController/schemas/findAddressesSchema';
import { AddressEntityTestFactory } from '../../../application/modules/addressModule/tests/factories/addressEntityTestFactory/addressEntityTestFactory';
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
import { CustomerService } from '../../services/customerService/customerService';
import { UserService } from '../../services/userService/userService';

const baseUrl = '/addresses';

describe(`Addresses e2e`, () => {
  const userEntityTestFactory = new UserEntityTestFactory();
  const addressEntityTestFactory = new AddressEntityTestFactory();

  const httpService = new HttpServiceFactoryImpl(
    new FetchClientImpl(),
    new LoggerServiceImpl(new LoggerClientFactoryImpl({ logLevel: LogLevel.error }).create()),
  ).create({ baseUrl: '/' });

  const userService = new UserService(httpService);
  const customerService = new CustomerService(httpService);
  const authService = new AuthService(httpService);
  const addressService = new AddressService(httpService);

  describe('Create address', () => {
    it('returns bad request when not all required properties in body are provided', async () => {
      expect.assertions(1);

      const { email, password } = userEntityTestFactory.create();

      await userService.createUser({ email: email as string, password });

      const accessToken = await authService.getUserToken({ email: email as string, password });

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

      const { customer } = await customerService.createCustomer({ userId: user.id });

      const { firstName, lastName, phoneNumber, country, state, city, zipCode, streetAddress } =
        addressEntityTestFactory.create();

      const response = await httpService.sendRequest({
        endpoint: baseUrl,
        method: HttpMethodName.post,
        body: {
          firstName,
          lastName,
          phoneNumber,
          country,
          state,
          city,
          zipCode,
          streetAddress,
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

      const { customer } = await customerService.createCustomer({ userId: user.id });

      const { firstName, lastName, phoneNumber, country, state, city, zipCode, streetAddress } =
        addressEntityTestFactory.create();

      const response = await httpService.sendRequest({
        endpoint: baseUrl,
        method: HttpMethodName.post,
        headers: { [HttpHeader.authorization]: `Bearer ${accessToken}` },
        body: {
          firstName,
          lastName,
          phoneNumber,
          country,
          state,
          city,
          zipCode,
          streetAddress,
          customerId: customer.id,
        },
      });

      expect(response.statusCode).toBe(HttpStatusCode.created);
    });
  });

  describe('Find address', () => {
    it('returns not found when address with given addressId does not exist', async () => {
      expect.assertions(1);

      const { email, password } = userEntityTestFactory.create();

      const { user } = await userService.createUser({ email: email as string, password });

      const accessToken = await authService.getUserToken({ email: email as string, password });

      await customerService.createCustomer({ userId: user.id });

      const { id } = addressEntityTestFactory.create();

      const response = await httpService.sendRequest({
        endpoint: `${baseUrl}/${id}`,
        method: HttpMethodName.get,
        headers: { [HttpHeader.authorization]: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(HttpStatusCode.notFound);
    });

    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      const { email, password } = userEntityTestFactory.create();

      const { firstName, lastName, phoneNumber, country, state, city, zipCode, streetAddress } =
        addressEntityTestFactory.create();

      const { user } = await userService.createUser({ email: email as string, password });

      const { customer } = await customerService.createCustomer({ userId: user.id });

      const { address } = await addressService.createAddress({
        firstName,
        lastName,
        phoneNumber,
        country,
        state,
        city,
        zipCode,
        streetAddress,
        customerId: customer.id,
      });

      const response = await httpService.sendRequest({
        endpoint: `${baseUrl}/${address.id}`,
        method: HttpMethodName.get,
      });

      expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
    });

    it(`returns forbidden when user requests other customer's address`, async () => {
      expect.assertions(1);

      const { email: email1, password } = userEntityTestFactory.create();

      const { email: email2 } = userEntityTestFactory.create();

      const { firstName, lastName, phoneNumber, country, state, city, zipCode, streetAddress } =
        addressEntityTestFactory.create();

      const { user: user1 } = await userService.createUser({ email: email1 as string, password });

      const { user: user2 } = await userService.createUser({ email: email2 as string, password });

      const { customer: customer1 } = await customerService.createCustomer({ userId: user1.id });

      await customerService.createCustomer({ userId: user2.id });

      const accessToken = await authService.getUserToken({ email: email2 as string, password });

      const { address } = await addressService.createAddress({
        firstName,
        lastName,
        phoneNumber,
        country,
        state,
        city,
        zipCode,
        streetAddress,
        customerId: customer1.id,
      });

      const response = await httpService.sendRequest({
        endpoint: `${baseUrl}/${address.id}`,
        method: HttpMethodName.get,
        headers: { [HttpHeader.authorization]: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(HttpStatusCode.forbidden);
    });

    it('accepts a request and returns ok when addressId is uuid and have corresponding address', async () => {
      expect.assertions(1);

      const { email, password } = userEntityTestFactory.create();

      const { firstName, lastName, phoneNumber, country, state, city, zipCode, streetAddress } =
        addressEntityTestFactory.create();

      const { user } = await userService.createUser({ email: email as string, password });

      const { customer } = await customerService.createCustomer({ userId: user.id });

      const accessToken = await authService.getUserToken({ email: email as string, password });

      const { address } = await addressService.createAddress({
        firstName,
        lastName,
        phoneNumber,
        country,
        state,
        city,
        zipCode,
        streetAddress,
        customerId: customer.id,
      });

      const response = await httpService.sendRequest({
        endpoint: `${baseUrl}/${address.id}`,
        method: HttpMethodName.get,
        headers: { [HttpHeader.authorization]: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(HttpStatusCode.ok);
    });
  });

  describe('Find addresses', () => {
    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      const response = await httpService.sendRequest({
        endpoint: baseUrl,
        method: HttpMethodName.get,
      });

      expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
    });

    it('returns addresses with filtering provided', async () => {
      expect.assertions(2);

      const { email: email1, password } = userEntityTestFactory.create();

      const { email: email2 } = userEntityTestFactory.create();

      const { firstName, lastName, phoneNumber, country, state, city, zipCode, streetAddress } =
        addressEntityTestFactory.create();

      const { user: user1 } = await userService.createUser({ email: email1 as string, password });

      const { user: user2 } = await userService.createUser({ email: email2 as string, password });

      const { customer: customer1 } = await customerService.createCustomer({ userId: user1.id });

      const { customer: customer2 } = await customerService.createCustomer({ userId: user2.id });

      await addressService.createAddress({
        firstName,
        lastName,
        phoneNumber,
        country,
        state,
        city,
        zipCode,
        streetAddress,
        customerId: customer1.id,
      });

      await addressService.createAddress({
        firstName,
        lastName,
        phoneNumber,
        country,
        state,
        city,
        zipCode,
        streetAddress,
        customerId: customer2.id,
      });

      const accessToken = await authService.getUserToken({ email: email1 as string, password });

      const response = await httpService.sendRequest({
        endpoint: `${baseUrl}?filter=["customerId||eq||${customer1.id}"]`,
        method: HttpMethodName.get,
        headers: { [HttpHeader.authorization]: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(HttpStatusCode.ok);
      expect((response.body as FindAddressesResponseOkBody).data.length).toBe(1);
    });
  });

  describe('Update address', () => {
    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      const { id, streetAddress } = addressEntityTestFactory.create();

      const response = await httpService.sendRequest({
        endpoint: `${baseUrl}/${id}`,
        method: HttpMethodName.patch,
        body: {
          streetAddress,
        },
      });

      expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
    });

    it('accepts a request and returns ok when all required body properties are provided', async () => {
      expect.assertions(1);

      const { email, password } = userEntityTestFactory.create();

      const { firstName, lastName, phoneNumber, country, state, city, zipCode, streetAddress } =
        addressEntityTestFactory.create();

      const { streetAddress: updatedStreetAddress } = addressEntityTestFactory.create();

      const { user } = await userService.createUser({ email: email as string, password });

      const { customer } = await customerService.createCustomer({ userId: user.id });

      const accessToken = await authService.getUserToken({ email: email as string, password });

      const { address } = await addressService.createAddress({
        firstName,
        lastName,
        phoneNumber,
        country,
        state,
        city,
        zipCode,
        streetAddress,
        customerId: customer.id,
      });

      const response = await httpService.sendRequest({
        endpoint: `${baseUrl}/${address.id}`,
        method: HttpMethodName.patch,
        headers: { [HttpHeader.authorization]: `Bearer ${accessToken}` },
        body: {
          streetAddress: updatedStreetAddress,
        },
      });

      expect(response.statusCode).toBe(HttpStatusCode.ok);
    });
  });

  describe('Delete address', () => {
    it('returns not found when address with given addressId does not exist', async () => {
      expect.assertions(1);

      const { email, password } = userEntityTestFactory.create();

      const { user } = await userService.createUser({ email: email as string, password });

      await customerService.createCustomer({ userId: user.id });

      const accessToken = await authService.getUserToken({ email: email as string, password });

      const { id } = addressEntityTestFactory.create();

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

      const { firstName, lastName, phoneNumber, country, state, city, zipCode, streetAddress } =
        addressEntityTestFactory.create();

      const { user } = await userService.createUser({ email: email as string, password });

      const { customer } = await customerService.createCustomer({ userId: user.id });

      const { address } = await addressService.createAddress({
        firstName,
        lastName,
        phoneNumber,
        country,
        state,
        city,
        zipCode,
        streetAddress,
        customerId: customer.id,
      });

      const response = await httpService.sendRequest({
        endpoint: `${baseUrl}/${address.id}`,
        method: HttpMethodName.delete,
      });

      expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
    });

    it('accepts a request and returns no content when addressId is uuid and corresponds to existing address', async () => {
      expect.assertions(1);

      const { email, password } = userEntityTestFactory.create();

      const { firstName, lastName, phoneNumber, country, state, city, zipCode, streetAddress } =
        addressEntityTestFactory.create();

      const { user } = await userService.createUser({ email: email as string, password });

      const { customer } = await customerService.createCustomer({ userId: user.id });

      const accessToken = await authService.getUserToken({ email: email as string, password });

      const { address } = await addressService.createAddress({
        firstName,
        lastName,
        phoneNumber,
        country,
        state,
        city,
        zipCode,
        streetAddress,
        customerId: customer.id,
      });

      const response = await httpService.sendRequest({
        endpoint: `${baseUrl}/${address.id}`,
        method: HttpMethodName.delete,
        headers: { [HttpHeader.authorization]: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(HttpStatusCode.noContent);
    });
  });
});
