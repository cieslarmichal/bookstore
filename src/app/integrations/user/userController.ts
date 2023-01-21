import express, { NextFunction, Request, Response } from 'express';
import { UserService } from '../../domain/user/services/userService';
import { RecordToInstanceTransformer, UnitOfWorkFactory } from '../../common';
import asyncHandler from 'express-async-handler';
import { StatusCodes } from 'http-status-codes';
import { userErrorMiddleware } from './middlewares';
import { AuthMiddleware, ControllerResponse, sendResponseMiddleware } from '../common';
import {
  RegisterUserResponseData,
  RegisterUserResponseDto,
  LoginUserResponseData,
  LoginUserResponseDto,
  FindUserParamDto,
  FindUserResponseData,
  FindUserResponseDto,
  RemoveUserParamDto,
  RemoveUserResponseDto,
  SetUserPasswordBodyDto,
  SetUserPasswordResponseDto,
  UserDto,
  LoginUserByEmailBodyDto,
  LoginUserByPhoneNumberBodyDto,
  RegisterUserByEmailBodyDto,
  RegisterUserByPhoneNumberBodyDto,
  SetUserPhoneNumberBodyDto,
  SetUserEmailResponseDto,
  SetUserEmailBodyDto,
} from './dtos';
import { UserRole } from '../../domain/user/types';
import { UserFromTokenAuthPayloadNotMatchingTargetUser } from './errors';

const USERS_PATH = '/users';
const USERS_PATH_WITH_ID = `${USERS_PATH}/:id`;
const REGISTER_PATH = `${USERS_PATH}/register`;
const LOGIN_PATH = `${USERS_PATH}/login`;
const SET_PASSWORD_PATH = `${USERS_PATH}/set-password`;
const SET_PHONE_NUMBER_PATH = `${USERS_PATH}/set-phone-number`;
const SET_EMAIL_PATH = `${USERS_PATH}/set-email`;

export class UserController {
  public readonly router = express.Router();

  public constructor(
    private readonly unitOfWorkFactory: UnitOfWorkFactory,
    private readonly userService: UserService,
    authMiddleware: AuthMiddleware,
  ) {
    const verifyAccessToken = authMiddleware.verifyToken.bind(authMiddleware);

    this.router.post(
      REGISTER_PATH,
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const registerUserResponse = await this.registerUser(request, response);
        response.locals.controllerResponse = registerUserResponse;
        next();
      }),
    );
    this.router.post(
      LOGIN_PATH,
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const loginUserResponse = await this.loginUser(request, response);
        response.locals.controllerResponse = loginUserResponse;
        next();
      }),
    );
    this.router.post(
      SET_PASSWORD_PATH,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const setUserPasswordResponse = await this.setUserPassword(request, response);
        response.locals.controllerResponse = setUserPasswordResponse;
        next();
      }),
    );
    this.router.post(
      SET_PHONE_NUMBER_PATH,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const setUserPhoneNumberResponse = await this.setUserPhoneNumber(request, response);
        response.locals.controllerResponse = setUserPhoneNumberResponse;
        next();
      }),
    );
    this.router.post(
      SET_EMAIL_PATH,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const setUserEmailResponse = await this.setUserEmail(request, response);
        response.locals.controllerResponse = setUserEmailResponse;
        next();
      }),
    );
    this.router.get(
      USERS_PATH_WITH_ID,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const findUserResponse = await this.findUser(request, response);
        response.locals.controllerResponse = findUserResponse;
        next();
      }),
    );
    this.router.delete(
      USERS_PATH_WITH_ID,
      [verifyAccessToken],
      asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const deleteUserResponse = await this.deleteUser(request, response);
        response.locals.controllerResponse = deleteUserResponse;
        next();
      }),
    );
    this.router.use(sendResponseMiddleware);
    this.router.use(userErrorMiddleware);
  }

  public async registerUser(request: Request, response: Response): Promise<ControllerResponse> {
    const unitOfWork = await this.unitOfWorkFactory.create();

    const user = await unitOfWork.runInTransaction(async () => {
      let user: UserDto;

      let registerUserBodyDto: RegisterUserByEmailBodyDto | RegisterUserByPhoneNumberBodyDto;

      if (request.body.email) {
        registerUserBodyDto = RecordToInstanceTransformer.strictTransform(request.body, RegisterUserByEmailBodyDto);
        user = await this.userService.registerUserByEmail(unitOfWork, registerUserBodyDto);
      } else {
        registerUserBodyDto = RecordToInstanceTransformer.strictTransform(
          request.body,
          RegisterUserByPhoneNumberBodyDto,
        );
        user = await this.userService.registerUserByPhoneNumber(unitOfWork, registerUserBodyDto);
      }

      return user;
    });

    const userDto = UserDto.create({
      id: user.id,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      email: user.email,
      role: user.role,
    });

    const responseData = new RegisterUserResponseData(userDto);

    return new RegisterUserResponseDto(responseData, StatusCodes.CREATED);
  }

  public async loginUser(request: Request, response: Response): Promise<ControllerResponse> {
    const unitOfWork = await this.unitOfWorkFactory.create();

    const token = await unitOfWork.runInTransaction(async () => {
      let token: string;

      let loginUserBodyDto: LoginUserByEmailBodyDto | LoginUserByPhoneNumberBodyDto;

      if (request.body.email) {
        loginUserBodyDto = RecordToInstanceTransformer.strictTransform(request.body, LoginUserByEmailBodyDto);
        token = await this.userService.loginUserByEmail(unitOfWork, loginUserBodyDto);
      } else {
        loginUserBodyDto = RecordToInstanceTransformer.strictTransform(request.body, LoginUserByPhoneNumberBodyDto);
        token = await this.userService.loginUserByPhoneNumber(unitOfWork, loginUserBodyDto);
      }

      return token;
    });

    const responseData = new LoginUserResponseData(token);

    return new LoginUserResponseDto(responseData, StatusCodes.OK);
  }

  public async setUserPassword(request: Request, response: Response): Promise<ControllerResponse> {
    const unitOfWork = await this.unitOfWorkFactory.create();

    const setUserPasswordBodyDto = RecordToInstanceTransformer.strictTransform(request.body, SetUserPasswordBodyDto);

    const { userId: targetUserId, password } = setUserPasswordBodyDto;

    const { userId, role } = response.locals.authPayload;

    if (userId !== targetUserId && role === UserRole.user) {
      throw new UserFromTokenAuthPayloadNotMatchingTargetUser({ userId, targetUserId });
    }

    await unitOfWork.runInTransaction(async () => {
      await this.userService.setPassword(unitOfWork, userId, password);
    });

    return new SetUserPasswordResponseDto(StatusCodes.NO_CONTENT);
  }

  public async setUserPhoneNumber(request: Request, response: Response): Promise<ControllerResponse> {
    const unitOfWork = await this.unitOfWorkFactory.create();

    const setUserPhoneNumberBodyDto = RecordToInstanceTransformer.strictTransform(
      request.body,
      SetUserPhoneNumberBodyDto,
    );

    const { userId: targetUserId, phoneNumber } = setUserPhoneNumberBodyDto;

    const { userId, role } = response.locals.authPayload;

    if (userId !== targetUserId && role === UserRole.user) {
      throw new UserFromTokenAuthPayloadNotMatchingTargetUser({ userId, targetUserId });
    }

    await unitOfWork.runInTransaction(async () => {
      await this.userService.setPhoneNumber(unitOfWork, userId, phoneNumber);
    });

    return new SetUserPasswordResponseDto(StatusCodes.NO_CONTENT);
  }

  public async setUserEmail(request: Request, response: Response): Promise<ControllerResponse> {
    const unitOfWork = await this.unitOfWorkFactory.create();

    const setUserEmailBodyDto = RecordToInstanceTransformer.strictTransform(request.body, SetUserEmailBodyDto);

    const { userId: targetUserId, email } = setUserEmailBodyDto;

    const { userId, role } = response.locals.authPayload;

    if (userId !== targetUserId && role === UserRole.user) {
      throw new UserFromTokenAuthPayloadNotMatchingTargetUser({ userId, targetUserId });
    }

    await unitOfWork.runInTransaction(async () => {
      await this.userService.setEmail(unitOfWork, userId, email);
    });

    return new SetUserEmailResponseDto(StatusCodes.NO_CONTENT);
  }

  public async findUser(request: Request, response: Response): Promise<ControllerResponse> {
    const unitOfWork = await this.unitOfWorkFactory.create();

    const { id: targetUserId } = RecordToInstanceTransformer.strictTransform(request.params, FindUserParamDto);

    const { userId, role } = response.locals.authPayload;

    if (userId !== targetUserId && role === UserRole.user) {
      throw new UserFromTokenAuthPayloadNotMatchingTargetUser({ userId, targetUserId });
    }

    const userDto = await unitOfWork.runInTransaction(async () => {
      const user = await this.userService.findUser(unitOfWork, targetUserId);

      return user;
    });

    const controllerUserDto = UserDto.create({
      id: userDto.id,
      createdAt: userDto.createdAt,
      updatedAt: userDto.updatedAt,
      email: userDto.email,
      role: userDto.role,
    });
    const responseData = new FindUserResponseData(controllerUserDto);

    return new FindUserResponseDto(responseData, StatusCodes.OK);
  }

  public async deleteUser(request: Request, response: Response): Promise<ControllerResponse> {
    const unitOfWork = await this.unitOfWorkFactory.create();

    const { id: targetUserId } = RecordToInstanceTransformer.strictTransform(request.params, RemoveUserParamDto);

    const { userId, role } = response.locals.authPayload;

    if (userId !== targetUserId && role === UserRole.user) {
      throw new UserFromTokenAuthPayloadNotMatchingTargetUser({ userId, targetUserId });
    }

    await unitOfWork.runInTransaction(async () => {
      await this.userService.removeUser(unitOfWork, targetUserId);
    });

    return new RemoveUserResponseDto(StatusCodes.NO_CONTENT);
  }
}
