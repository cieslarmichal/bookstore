/* eslint-disable @typescript-eslint/naming-convention */
import { Router, NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

import { cartErrorMiddleware } from './cartErrorMiddleware';
import { HttpStatusCode } from '../../../common/http/contracts/httpStatusCode';
import { PayloadFactory } from '../../../common/validator/implementations/payloadFactory';
import { cartSymbols } from '../../../domain/cart/cartSymbols';
import { Cart } from '../../../domain/cart/contracts/cart';
import { CartService } from '../../../domain/cart/contracts/services/cartService/cartService';
import { Customer } from '../../../domain/customer/contracts/customer';
import { CustomerService } from '../../../domain/customer/contracts/services/customerService/customerService';
import { customerSymbols } from '../../../domain/customer/customerSymbols';
import { UserRole } from '../../../domain/user/contracts/userRole';
import { Inject, Injectable } from '../../../libs/dependencyInjection/contracts/decorators';
import { UnitOfWorkFactory } from '../../../libs/unitOfWork/contracts/factories/unitOfWorkFactory/unitOfWorkFactory';
import { unitOfWorkSymbols } from '../../../libs/unitOfWork/unitOfWorkSymbols';
import { AccessTokenData } from '../../accessTokenData';
import { AuthMiddleware } from '../../common/middlewares/authMiddleware';
import { sendResponseMiddleware } from '../../common/middlewares/sendResponseMiddleware';
import { ControllerResponse } from '../../controllerResponse';
import { integrationsSymbols } from '../../integrationsSymbols';
import { LocalsName } from '../../localsName';
import { AddLineItemPayload, addLineItemPayloadSchema } from '../contracts/addLineItemPayload';
import { CreateCartPayload, createCartPayloadSchema } from '../contracts/createCartPayload';
import { DeleteCartPayload, deleteCartPayloadSchema } from '../contracts/deleteCartPayload';
import { FindCartPayload, findCartPayloadSchema } from '../contracts/findCartPayload';
import { RemoveLineItemPayload, removeLineItemPayloadSchema } from '../contracts/removeLineItemPayload';
import { UpdateCartPayload, updateCartPayloadSchema } from '../contracts/updateCartPayload';
import { CustomerFromAccessTokenNotMatchingCustomerFromCartError } from '../errors/customerFromAccessTokenNotMatchingCustomerFromCartError';
import { UserIsNotCustomerError } from '../errors/userIsNotCustomerError';

@Injectable()
export class CartController {
  public readonly router = Router();
  private readonly cartsEndpoint = '/carts';
  private readonly cartEndpoint = `${this.cartsEndpoint}/:id`;
  private readonly addLineItemEnpoint = `${this.cartEndpoint}/add-line-item`;
  private readonly removeLineItemEnpoint = `${this.cartEndpoint}/remove-line-item`;

  public constructor(
    @Inject(unitOfWorkSymbols.unitOfWorkFactory)
    private readonly unitOfWorkFactory: UnitOfWorkFactory,
    @Inject(cartSymbols.cartService)
    private readonly cartService: CartService,
    @Inject(customerSymbols.customerService)
    private readonly customerService: CustomerService,
    @Inject(integrationsSymbols.authMiddleware)
    authMiddleware: AuthMiddleware,
  ) {
    const verifyAccessToken = authMiddleware.verifyToken.bind(authMiddleware);

    this.router.post(
      this.cartsEndpoint,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const { customerId } = request.body;

        const accessTokenData: AccessTokenData = response.locals[LocalsName.accessTokenData];

        const cart = await this.createCart({
          customerId,
          accessTokenData,
        });

        const controllerResponse: ControllerResponse = { data: { cart }, statusCode: HttpStatusCode.created };

        response.locals[LocalsName.controllerResponse] = controllerResponse;

        next();
      }),
    );

    this.router.post(
      this.addLineItemEnpoint,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const { id } = request.params;

        const { bookId, quantity } = request.body;

        const accessTokenData: AccessTokenData = response.locals[LocalsName.accessTokenData];

        const cart = await this.addLineItem({
          id: id as string,
          bookId,
          quantity,
          accessTokenData,
        });

        const controllerResponse: ControllerResponse = { data: { cart }, statusCode: HttpStatusCode.ok };

        response.locals[LocalsName.controllerResponse] = controllerResponse;

        next();
      }),
    );

    this.router.post(
      this.removeLineItemEnpoint,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const { id } = request.params;

        const { lineItemId, quantity } = request.body;

        const accessTokenData: AccessTokenData = response.locals[LocalsName.accessTokenData];

        const cart = await this.removeLineItem({
          id: id as string,
          lineItemId,
          quantity,
          accessTokenData,
        });

        const controllerResponse: ControllerResponse = { data: { cart }, statusCode: HttpStatusCode.ok };

        response.locals[LocalsName.controllerResponse] = controllerResponse;

        next();
      }),
    );

    this.router.get(
      this.cartEndpoint,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const { id } = request.params;

        const accessTokenData: AccessTokenData = response.locals[LocalsName.accessTokenData];

        const cart = await this.findCart({ accessTokenData, id: id as string });

        const controllerResponse: ControllerResponse = { data: { cart }, statusCode: HttpStatusCode.ok };

        response.locals[LocalsName.controllerResponse] = controllerResponse;

        next();
      }),
    );

    this.router.patch(
      this.cartEndpoint,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const { id } = request.params;

        const { billingAddressId, deliveryMethod, shippingAddressId } = request.body;

        const accessTokenData: AccessTokenData = response.locals[LocalsName.accessTokenData];

        const cart = await this.updateCart({
          id: id as string,
          accessTokenData,
          billingAddressId,
          deliveryMethod,
          shippingAddressId,
        });

        const controllerResponse: ControllerResponse = { data: { cart }, statusCode: HttpStatusCode.ok };

        response.locals[LocalsName.controllerResponse] = controllerResponse;

        next();
      }),
    );

    this.router.delete(
      this.cartEndpoint,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const { id } = request.params;

        const accessTokenData: AccessTokenData = response.locals[LocalsName.accessTokenData];

        await this.deleteCart({ id: id as string, accessTokenData });

        const controllerResponse: ControllerResponse = { statusCode: HttpStatusCode.noContent };

        response.locals[LocalsName.controllerResponse] = controllerResponse;

        next();
      }),
    );

    this.router.use(sendResponseMiddleware);

    this.router.use(cartErrorMiddleware);
  }

  private async createCart(input: CreateCartPayload): Promise<Cart> {
    const { customerId, accessTokenData } = PayloadFactory.create(createCartPayloadSchema, input);

    const unitOfWork = await this.unitOfWorkFactory.create();

    const cart = await unitOfWork.runInTransaction(async () => {
      const { userId } = accessTokenData;

      try {
        await this.customerService.findCustomer({ unitOfWork, userId });
      } catch (error) {
        throw new UserIsNotCustomerError({ userId });
      }

      return this.cartService.createCart({
        unitOfWork,
        draft: { customerId },
      });
    });

    return cart;
  }

  private async findCart(input: FindCartPayload): Promise<Cart> {
    const { id, accessTokenData } = PayloadFactory.create(findCartPayloadSchema, input);

    const unitOfWork = await this.unitOfWorkFactory.create();

    const cart = await unitOfWork.runInTransaction(async () => {
      const { userId, role } = accessTokenData;

      let customer: Customer;

      try {
        customer = await this.customerService.findCustomer({ unitOfWork, userId });
      } catch (error) {
        throw new UserIsNotCustomerError({ userId });
      }

      const customerCart = await this.cartService.findCart({ unitOfWork, cartId: id as string });

      if (customerCart.customerId !== customer.id && role === UserRole.user) {
        throw new CustomerFromAccessTokenNotMatchingCustomerFromCartError({
          customerId: customer.id,
          targetCustomerId: customerCart.customerId as string,
        });
      }

      return customerCart;
    });

    return cart;
  }

  private async updateCart(input: UpdateCartPayload): Promise<Cart> {
    const { accessTokenData, id, billingAddressId, deliveryMethod, shippingAddressId } = PayloadFactory.create(
      updateCartPayloadSchema,
      input,
    );

    const unitOfWork = await this.unitOfWorkFactory.create();

    const cart = await unitOfWork.runInTransaction(async () => {
      const { userId, role } = accessTokenData;

      let customer: Customer;

      try {
        customer = await this.customerService.findCustomer({ unitOfWork, userId });
      } catch (error) {
        throw new UserIsNotCustomerError({ userId });
      }

      const customerCart = await this.cartService.findCart({ unitOfWork, cartId: id });

      if (customerCart.customerId !== customer.id && role === UserRole.user) {
        throw new CustomerFromAccessTokenNotMatchingCustomerFromCartError({
          customerId: customer.id,
          targetCustomerId: customerCart.customerId,
        });
      }

      const updatedCart = await this.cartService.updateCart({
        unitOfWork,
        cartId: id,
        draft: { billingAddressId, deliveryMethod, shippingAddressId },
      });

      return updatedCart;
    });

    return cart;
  }

  private async addLineItem(input: AddLineItemPayload): Promise<Cart> {
    const { accessTokenData, id, bookId, quantity } = PayloadFactory.create(addLineItemPayloadSchema, input);

    const unitOfWork = await this.unitOfWorkFactory.create();

    const cart = await unitOfWork.runInTransaction(async () => {
      const { userId, role } = accessTokenData;

      let customer: Customer;

      try {
        customer = await this.customerService.findCustomer({ unitOfWork, userId });
      } catch (error) {
        throw new UserIsNotCustomerError({ userId });
      }

      const customerCart = await this.cartService.findCart({ unitOfWork, cartId: id });

      if (customerCart.customerId !== customer.id && role === UserRole.user) {
        throw new CustomerFromAccessTokenNotMatchingCustomerFromCartError({
          customerId: customer.id,
          targetCustomerId: customerCart.customerId,
        });
      }

      const updatedCart = await this.cartService.addLineItem({
        unitOfWork,
        cartId: id,
        draft: { bookId, quantity },
      });

      return updatedCart;
    });

    return cart;
  }

  private async removeLineItem(input: RemoveLineItemPayload): Promise<Cart> {
    const { accessTokenData, id, lineItemId, quantity } = PayloadFactory.create(removeLineItemPayloadSchema, input);

    const unitOfWork = await this.unitOfWorkFactory.create();

    const cart = await unitOfWork.runInTransaction(async () => {
      const { userId, role } = accessTokenData;

      let customer: Customer;

      try {
        customer = await this.customerService.findCustomer({ unitOfWork, userId });
      } catch (error) {
        throw new UserIsNotCustomerError({ userId });
      }

      const customerCart = await this.cartService.findCart({ unitOfWork, cartId: id });

      if (customerCart.customerId !== customer.id && role === UserRole.user) {
        throw new CustomerFromAccessTokenNotMatchingCustomerFromCartError({
          customerId: customer.id,
          targetCustomerId: customerCart.customerId,
        });
      }

      const updatedCart = await this.cartService.removeLineItem({
        unitOfWork,
        cartId: id,
        draft: { lineItemId, quantity },
      });

      return updatedCart;
    });

    return cart;
  }

  private async deleteCart(input: DeleteCartPayload): Promise<void> {
    const { id, accessTokenData } = PayloadFactory.create(deleteCartPayloadSchema, input);

    const unitOfWork = await this.unitOfWorkFactory.create();

    await unitOfWork.runInTransaction(async () => {
      const { userId, role } = accessTokenData;

      let customer: Customer;

      try {
        customer = await this.customerService.findCustomer({ unitOfWork, userId });
      } catch (error) {
        throw new UserIsNotCustomerError({ userId });
      }

      const customerCart = await this.cartService.findCart({ unitOfWork, cartId: id });

      if (customerCart.customerId !== customer.id && role === UserRole.user) {
        throw new CustomerFromAccessTokenNotMatchingCustomerFromCartError({
          customerId: customer.id,
          targetCustomerId: customerCart.customerId,
        });
      }

      await this.cartService.deleteCart({ unitOfWork, cartId: id });
    });
  }
}
