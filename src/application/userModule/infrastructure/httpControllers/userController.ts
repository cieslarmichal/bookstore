import { Router, NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

import { DeleteUserPayload, deleteUserPayloadSchema } from './payloads/deleteUserPayload';
import { FindUserPayload, findUserPayloadSchema } from './payloads/findUserPayload';
import { LoginUserPayload, loginUserPayloadSchema } from './payloads/loginUserPayload';
import { RegisterUserPayload, registerUserPayloadSchema } from './payloads/registerUserPayload';
import { SetUserEmailPayload, setUserEmailPayloadSchema } from './payloads/setUserEmailPayload';
import { SetUserPasswordPayload, setUserPasswordPayloadSchema } from './payloads/setUserPasswordPayload';
import { SetUserPhoneNumberPayload, setUserPhoneNumberPayloadSchema } from './payloads/setUserPhoneNumberPayload';
import { userErrorMiddleware } from './userErrorMiddleware';
import { HttpStatusCode } from '../../../../common/http/httpStatusCode';
import { AuthMiddleware } from '../../../../common/middlewares/authMiddleware';
import { sendResponseMiddleware } from '../../../../common/middlewares/sendResponseMiddleware';
import { ControllerResponse } from '../../../../common/types/controllerResponse';
import { LocalsName } from '../../../../common/types/localsName';
import { Injectable, Inject } from '../../../../libs/dependencyInjection/decorators';
import { UnitOfWorkFactory } from '../../../../libs/unitOfWork/factories/unitOfWorkFactory/unitOfWorkFactory';
import { unitOfWorkModuleSymbols } from '../../../../libs/unitOfWork/unitOfWorkModuleSymbols';
import { Validator } from '../../../../libs/validator/validator';
import { UserService } from '../../application/services/userService/userService';
import { User } from '../../domain/entities/user/user';
import { UserRole } from '../../domain/entities/user/userRole';
import { userModuleSymbols } from '../../userModuleSymbols';
import { UserFromAccessTokenNotMatchingTargetUserError } from '../errors/userFromTokenAuthPayloadNotMatchingTargetUserError';

@Injectable()
export class UserController {
  public readonly router = Router();
  private readonly usersEndpoint = '/users';
  private readonly userEndpoint = `${this.usersEndpoint}/:id`;
  private readonly registerUserEndpoint = `${this.usersEndpoint}/register`;
  private readonly loginUserEndpoint = `${this.usersEndpoint}/login`;
  private readonly setUserPasswordEndpoint = `${this.usersEndpoint}/set-password`;
  private readonly setUserPhoneNumberEndpoint = `${this.usersEndpoint}/set-phone-number`;
  private readonly setUserEmailEndpoint = `${this.usersEndpoint}/set-email`;

  public constructor(
    @Inject(unitOfWorkModuleSymbols.unitOfWorkFactory)
    private readonly unitOfWorkFactory: UnitOfWorkFactory,
    @Inject(userModuleSymbols.userService)
    private readonly userService: UserService,
    @Inject(integrationsSymbols.authMiddleware)
    authMiddleware: AuthMiddleware,
  ) {
    const verifyAccessToken = authMiddleware.verifyToken.bind(authMiddleware);

    this.router.post(
      this.registerUserEndpoint,
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const { phoneNumber, email, password } = request.body;

        const user = await this.registerUser({ email, phoneNumber, password });

        const controllerResponse: ControllerResponse = {
          data: {
            user: {
              id: user.id,
              email: user.email,
              role: user.role,
            },
          },
          statusCode: HttpStatusCode.created,
        };

        response.locals[LocalsName.controllerResponse] = controllerResponse;

        next();
      }),
    );

    this.router.post(
      this.loginUserEndpoint,
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const { phoneNumber, email, password } = request.body;

        const token = await this.loginUser({ email, phoneNumber, password });

        const controllerResponse: ControllerResponse = { data: { token }, statusCode: HttpStatusCode.ok };

        response.locals[LocalsName.controllerResponse] = controllerResponse;

        next();
      }),
    );

    this.router.post(
      this.setUserPasswordEndpoint,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const { userId, password } = request.body;

        const accessTokenData = response.locals[LocalsName.accessTokenData];

        await this.setUserPassword({ userId, password, accessTokenData });

        const controllerResponse: ControllerResponse = { statusCode: HttpStatusCode.noContent };

        response.locals[LocalsName.controllerResponse] = controllerResponse;

        next();
      }),
    );

    this.router.post(
      this.setUserPhoneNumberEndpoint,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const { userId, phoneNumber } = request.body;

        const accessTokenData = response.locals[LocalsName.accessTokenData];

        await this.setUserPhoneNumber({ userId, phoneNumber, accessTokenData });

        const controllerResponse: ControllerResponse = { statusCode: HttpStatusCode.noContent };

        response.locals[LocalsName.controllerResponse] = controllerResponse;

        next();
      }),
    );

    this.router.post(
      this.setUserEmailEndpoint,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const { userId, email } = request.body;

        const accessTokenData = response.locals[LocalsName.accessTokenData];

        await this.setUserEmail({ userId, email, accessTokenData });

        const controllerResponse: ControllerResponse = { statusCode: HttpStatusCode.noContent };

        response.locals[LocalsName.controllerResponse] = controllerResponse;

        next();
      }),
    );

    this.router.get(
      this.userEndpoint,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const { id } = request.params;

        const accessTokenData = response.locals[LocalsName.accessTokenData];

        const user = await this.findUser({ id: id as string, accessTokenData });

        const controllerResponse: ControllerResponse = {
          data: {
            user: {
              id: user.id,
              email: user.email,
              role: user.role,
            },
          },
          statusCode: HttpStatusCode.ok,
        };

        response.locals[LocalsName.controllerResponse] = controllerResponse;

        next();
      }),
    );

    this.router.delete(
      this.userEndpoint,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const { id } = request.params;

        const accessTokenData = response.locals[LocalsName.accessTokenData];

        await this.deleteUser({ id: id as string, accessTokenData });

        const controllerResponse: ControllerResponse = { statusCode: HttpStatusCode.noContent };

        response.locals[LocalsName.controllerResponse] = controllerResponse;

        next();
      }),
    );

    this.router.use(sendResponseMiddleware);

    this.router.use(userErrorMiddleware);
  }

  private async registerUser(input: RegisterUserPayload): Promise<User> {
    const { email, password, phoneNumber } = Validator.validate(registerUserPayloadSchema, input);

    const unitOfWork = await this.unitOfWorkFactory.create();

    const user = await unitOfWork.runInTransaction(async () => {
      if (email) {
        return this.userService.registerUserByEmail({ unitOfWork, draft: { email, password } });
      } else {
        return this.userService.registerUserByPhoneNumber({
          unitOfWork,
          draft: { phoneNumber: phoneNumber as string, password },
        });
      }
    });

    return user;
  }

  private async loginUser(input: LoginUserPayload): Promise<string> {
    const { email, password, phoneNumber } = Validator.validate(loginUserPayloadSchema, input);

    const unitOfWork = await this.unitOfWorkFactory.create();

    const token = await unitOfWork.runInTransaction(async () => {
      if (email) {
        return this.userService.loginUserByEmail({ unitOfWork, draft: { email, password } });
      } else {
        return this.userService.loginUserByPhoneNumber({
          unitOfWork,
          draft: { phoneNumber: phoneNumber as string, password },
        });
      }
    });

    return token;
  }

  private async setUserPassword(input: SetUserPasswordPayload): Promise<void> {
    const { userId, password, accessTokenData } = Validator.validate(setUserPasswordPayloadSchema, input);

    const unitOfWork = await this.unitOfWorkFactory.create();

    if (userId !== accessTokenData.userId && accessTokenData.role === UserRole.user) {
      throw new UserFromAccessTokenNotMatchingTargetUserError({ userId, accessTokenData });
    }

    await unitOfWork.runInTransaction(async () => {
      await this.userService.setUserPassword({ unitOfWork, userId, password });
    });
  }

  private async setUserPhoneNumber(input: SetUserPhoneNumberPayload): Promise<void> {
    const { userId, phoneNumber, accessTokenData } = Validator.validate(setUserPhoneNumberPayloadSchema, input);

    const unitOfWork = await this.unitOfWorkFactory.create();

    if (userId !== accessTokenData.userId && accessTokenData.role === UserRole.user) {
      throw new UserFromAccessTokenNotMatchingTargetUserError({ userId, accessTokenData });
    }

    await unitOfWork.runInTransaction(async () => {
      await this.userService.setUserPhoneNumber({ unitOfWork, userId, phoneNumber });
    });
  }

  private async setUserEmail(input: SetUserEmailPayload): Promise<void> {
    const { userId, email, accessTokenData } = Validator.validate(setUserEmailPayloadSchema, input);

    const unitOfWork = await this.unitOfWorkFactory.create();

    if (userId !== accessTokenData.userId && accessTokenData.role === UserRole.user) {
      throw new UserFromAccessTokenNotMatchingTargetUserError({ userId, accessTokenData });
    }

    await unitOfWork.runInTransaction(async () => {
      await this.userService.setUserEmail({ unitOfWork, userId, email });
    });
  }

  private async findUser(input: FindUserPayload): Promise<User> {
    const { id: userId, accessTokenData } = Validator.validate(findUserPayloadSchema, input);

    const unitOfWork = await this.unitOfWorkFactory.create();

    if (userId !== accessTokenData.userId && accessTokenData.role === UserRole.user) {
      throw new UserFromAccessTokenNotMatchingTargetUserError({ userId, accessTokenData });
    }

    const user = await unitOfWork.runInTransaction(async () => {
      return this.userService.findUser({ unitOfWork, userId });
    });

    return user;
  }

  private async deleteUser(input: DeleteUserPayload): Promise<void> {
    const { id: userId, accessTokenData } = Validator.validate(deleteUserPayloadSchema, input);

    const unitOfWork = await this.unitOfWorkFactory.create();

    if (userId !== accessTokenData.userId && accessTokenData.role === UserRole.user) {
      throw new UserFromAccessTokenNotMatchingTargetUserError({ userId, accessTokenData });
    }

    await unitOfWork.runInTransaction(async () => {
      await this.userService.deleteUser({ unitOfWork, userId });
    });
  }
}
