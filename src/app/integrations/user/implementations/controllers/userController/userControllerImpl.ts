import { Router, NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { StatusCodes } from 'http-status-codes';

import { UserService } from '../../../../../domain/user/contracts/services/userService/userService';
import { UserRole } from '../../../../../domain/user/contracts/userRole';
import { UnitOfWorkFactory } from '../../../../../libs/unitOfWork/unitOfWorkFactory';
import { AuthMiddleware } from '../../../../common/middlewares/authMiddleware';
import { sendResponseMiddleware } from '../../../../common/middlewares/sendResponseMiddleware';
import { ControllerResponse } from '../../../../controllerResponse';
import { UserController } from '../../../contracts/controllers/userController/userController';
import { UserFromAccessTokenNotMatchingTargetUserError } from '../../../errors/userFromTokenAuthPayloadNotMatchingTargetUserError';
import { userErrorMiddleware } from '../../middlewares/userErrorMiddleware/userErrorMiddleware';

const usersEndpoint = '/users';
const userEndpoint = `${usersEndpoint}/:id`;
const registerUserEndpoint = `${usersEndpoint}/register`;
const loginUserEndpoint = `${usersEndpoint}/login`;
const setUserPasswordEndpoint = `${usersEndpoint}/set-password`;
const setUserPhoneNumberEndpoint = `${usersEndpoint}/set-phone-number`;
const setUserEmailEndpoint = `${usersEndpoint}/set-email`;

export class UserControllerImpl implements UserController {
  public readonly router = Router();

  public constructor(
    private readonly unitOfWorkFactory: UnitOfWorkFactory,
    private readonly userService: UserService,
    authMiddleware: AuthMiddleware,
  ) {
    const verifyAccessToken = authMiddleware.verifyToken.bind(authMiddleware);

    this.router.post(
      registerUserEndpoint,
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const registerUserResponse = await this.registerUser(request, response);
        response.locals['controllerResponse'] = registerUserResponse;
        next();
      }),
    );
    this.router.post(
      loginUserEndpoint,
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const loginUserResponse = await this.loginUser(request, response);
        response.locals['controllerResponse'] = loginUserResponse;
        next();
      }),
    );
    this.router.post(
      setUserPasswordEndpoint,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const setUserPasswordResponse = await this.setUserPassword(request, response);
        response.locals['controllerResponse'] = setUserPasswordResponse;
        next();
      }),
    );
    this.router.post(
      setUserPhoneNumberEndpoint,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const setUserPhoneNumberResponse = await this.setUserPhoneNumber(request, response);
        response.locals['controllerResponse'] = setUserPhoneNumberResponse;
        next();
      }),
    );
    this.router.post(
      setUserEmailEndpoint,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const setUserEmailResponse = await this.setUserEmail(request, response);
        response.locals['controllerResponse'] = setUserEmailResponse;
        next();
      }),
    );
    this.router.get(
      userEndpoint,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const findUserResponse = await this.findUser(request, response);
        response.locals['controllerResponse'] = findUserResponse;
        next();
      }),
    );
    this.router.delete(
      userEndpoint,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const deleteUserResponse = await this.deleteUser(request, response);
        response.locals['controllerResponse'] = deleteUserResponse;
        next();
      }),
    );
    this.router.use(sendResponseMiddleware);
    this.router.use(userErrorMiddleware);
  }

  public async registerUser(request: Request, response: Response): Promise<ControllerResponse> {
    const unitOfWork = await this.unitOfWorkFactory.create();

    const user = await unitOfWork.runInTransaction(async () => {
      const { phoneNumber, email, password } = request.body;

      if (email) {
        return this.userService.registerUserByEmail(unitOfWork, { email, password });
      } else {
        return this.userService.registerUserByPhoneNumber(unitOfWork, { phoneNumber, password });
      }
    });

    return {
      data: {
        user: {
          id: user.id,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          email: user.email,
          role: user.role,
        },
      },
      statusCode: StatusCodes.CREATED,
    };
  }

  public async loginUser(request: Request, response: Response): Promise<ControllerResponse> {
    const unitOfWork = await this.unitOfWorkFactory.create();

    const token = await unitOfWork.runInTransaction(async () => {
      const { phoneNumber, email, password } = request.body;

      if (email) {
        return this.userService.loginUserByEmail(unitOfWork, { email, password });
      } else {
        return this.userService.loginUserByPhoneNumber(unitOfWork, { phoneNumber, password });
      }
    });

    return { data: { token }, statusCode: StatusCodes.OK };
  }

  public async setUserPassword(request: Request, response: Response): Promise<ControllerResponse> {
    const unitOfWork = await this.unitOfWorkFactory.create();

    const { userId: targetUserId, password } = request.body;

    const { userId, role } = response.locals['authPayload'];

    if (userId !== targetUserId && role === UserRole.user) {
      throw new UserFromAccessTokenNotMatchingTargetUserError({ userId, targetUserId });
    }

    await unitOfWork.runInTransaction(async () => {
      await this.userService.setPassword(unitOfWork, userId, password);
    });

    return { statusCode: StatusCodes.NO_CONTENT };
  }

  public async setUserPhoneNumber(request: Request, response: Response): Promise<ControllerResponse> {
    const unitOfWork = await this.unitOfWorkFactory.create();

    const { userId: targetUserId, phoneNumber } = request.body;

    const { userId, role } = response.locals['authPayload'];

    if (userId !== targetUserId && role === UserRole.user) {
      throw new UserFromAccessTokenNotMatchingTargetUserError({ userId, targetUserId });
    }

    await unitOfWork.runInTransaction(async () => {
      await this.userService.setPhoneNumber(unitOfWork, userId, phoneNumber);
    });

    return { statusCode: StatusCodes.NO_CONTENT };
  }

  public async setUserEmail(request: Request, response: Response): Promise<ControllerResponse> {
    const unitOfWork = await this.unitOfWorkFactory.create();

    const { userId: targetUserId, email } = request.body;

    const { userId, role } = response.locals['authPayload'];

    if (userId !== targetUserId && role === UserRole.user) {
      throw new UserFromAccessTokenNotMatchingTargetUserError({ userId, targetUserId });
    }

    await unitOfWork.runInTransaction(async () => {
      await this.userService.setEmail(unitOfWork, userId, email);
    });

    return { statusCode: StatusCodes.NO_CONTENT };
  }

  public async findUser(request: Request, response: Response): Promise<ControllerResponse> {
    const unitOfWork = await this.unitOfWorkFactory.create();

    const { id: targetUserId } = request.params;

    const { userId, role } = response.locals['authPayload'];

    if (userId !== targetUserId && role === UserRole.user) {
      throw new UserFromAccessTokenNotMatchingTargetUserError({ userId, targetUserId: targetUserId as string });
    }

    const user = await unitOfWork.runInTransaction(async () => {
      return this.userService.findUser(unitOfWork, targetUserId as string);
    });

    return {
      data: {
        user: {
          id: user.id,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          email: user.email,
          role: user.role,
        },
      },
      statusCode: StatusCodes.OK,
    };
  }

  public async deleteUser(request: Request, response: Response): Promise<ControllerResponse> {
    const unitOfWork = await this.unitOfWorkFactory.create();

    const { id: targetUserId } = request.params;

    const { userId, role } = response.locals['authPayload'];

    if (userId !== targetUserId && role === UserRole.user) {
      throw new UserFromAccessTokenNotMatchingTargetUserError({ userId, targetUserId: targetUserId as string });
    }

    await unitOfWork.runInTransaction(async () => {
      await this.userService.removeUser(unitOfWork, targetUserId as string);
    });

    return { statusCode: StatusCodes.NO_CONTENT };
  }
}
