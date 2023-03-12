import { Router, NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

import { cartErrorMiddleware } from './cartErrorMiddleware';
import { AddLineItemPayload, addLineItemPayloadSchema } from './payloads/addLineItemPayload';
import { CreateCartPayload, createCartPayloadSchema } from './payloads/createCartPayload';
import { DeleteCartPayload, deleteCartPayloadSchema } from './payloads/deleteCartPayload';
import { FindCartPayload, findCartPayloadSchema } from './payloads/findCartPayload';
import { RemoveLineItemPayload, removeLineItemPayloadSchema } from './payloads/removeLineItemPayload';
import { UpdateCartPayload, updateCartPayloadSchema } from './payloads/updateCartPayload';
import { HttpStatusCode } from '../../../../../common/http/httpStatusCode';
import { AuthMiddleware } from '../../../../../common/middlewares/authMiddleware';
import { sendResponseMiddleware } from '../../../../../common/middlewares/sendResponseMiddleware';
import { AccessTokenData } from '../../../../../common/types/accessTokenData';
import { ControllerResponse } from '../../../../../common/types/controllerResponse';
import { LocalsName } from '../../../../../common/types/localsName';
import { Injectable, Inject } from '../../../../../libs/dependencyInjection/decorators';
import { UnitOfWorkFactory } from '../../../../../libs/unitOfWork/factories/unitOfWorkFactory/unitOfWorkFactory';
import { unitOfWorkModuleSymbols } from '../../../../../libs/unitOfWork/unitOfWorkModuleSymbols';
import { Validator } from '../../../../../libs/validator/validator';
import { customerModuleSymbols } from '../../../../customerModule/customerModuleSymbols';
import { Customer } from '../../../../customerModule/domain/entities/customer/customer';
import { CustomerService } from '../../../../tests/services/customerService';
import { UserRole } from '../../../../userModule/domain/entities/user/userRole';
import { CartService } from '../../../application/services/cartService/cartService';
import { Cart } from '../../../domain/entities/cart/cart';
import { orderModuleSymbols } from '../../../orderModuleSymbols';
import { CustomerFromAccessTokenNotMatchingCustomerFromCartError } from '../../errors/customerFromAccessTokenNotMatchingCustomerFromCartError';
import { UserIsNotCustomerError } from '../../errors/userIsNotCustomerError';

@Injectable()
export class CartController {
  public readonly router = Router();
  private readonly cartsEndpoint = '/carts';
  private readonly cartEndpoint = `${this.cartsEndpoint}/:id`;
  private readonly addLineItemEnpoint = `${this.cartEndpoint}/add-line-item`;
  private readonly removeLineItemEnpoint = `${this.cartEndpoint}/remove-line-item`;

  public constructor(
    @Inject(unitOfWorkModuleSymbols.unitOfWorkFactory)
    private readonly unitOfWorkFactory: UnitOfWorkFactory,
    @Inject(orderModuleSymbols.cartService)
    private readonly cartService: CartService,
    @Inject(customerModuleSymbols.customerService)
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
    const { customerId, accessTokenData } = Validator.validate(createCartPayloadSchema, input);

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
    const { id, accessTokenData } = Validator.validate(findCartPayloadSchema, input);

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
    const { accessTokenData, id, billingAddressId, deliveryMethod, shippingAddressId } = Validator.validate(
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
    const { accessTokenData, id, bookId, quantity } = Validator.validate(addLineItemPayloadSchema, input);

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
    const { accessTokenData, id, lineItemId, quantity } = Validator.validate(removeLineItemPayloadSchema, input);

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
    const { id, accessTokenData } = Validator.validate(deleteCartPayloadSchema, input);

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
