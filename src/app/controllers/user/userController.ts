import express, { NextFunction, Request, Response } from 'express';
import { UserService } from '../../domain/user/services/userService';
import { LoginUserData, RegisterUserData } from '../../domain/user/services/types';
import { RecordToInstanceTransformer } from '../../shared';
import asyncHandler from 'express-async-handler';
import { StatusCodes } from 'http-status-codes';
import { userErrorMiddleware } from './middlewares';
import { AuthMiddleware, ControllerResponse, sendResponseMiddleware } from '../shared';
import {
  RegisterUserBodyDto,
  RegisterUserResponseData,
  RegisterUserResponseDto,
  LoginUserBodyDto,
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
} from './dtos';

const USERS_PATH = '/users';
const USERS_PATH_WITH_ID = `${USERS_PATH}/:id`;
const REGISTER_PATH = `${USERS_PATH}/register`;
const LOGIN_PATH = `${USERS_PATH}/login`;
const SET_PASSWORD_PATH = `${USERS_PATH}/set-password`;

export class UserController {
  public readonly router = express.Router();

  public constructor(private readonly userService: UserService, authMiddleware: AuthMiddleware) {
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
    const registerUserBodyDto = RecordToInstanceTransformer.transform(request.body, RegisterUserBodyDto);

    const registerUserData = RecordToInstanceTransformer.transform(registerUserBodyDto, RegisterUserData);

    const userDto = await this.userService.registerUser(registerUserData);

    const controllerUserDto = UserDto.create({
      id: userDto.id,
      createdAt: userDto.createdAt,
      updatedAt: userDto.updatedAt,
      email: userDto.email,
      role: userDto.role,
    });

    const responseData = new RegisterUserResponseData(controllerUserDto);

    return new RegisterUserResponseDto(responseData, StatusCodes.CREATED);
  }

  public async loginUser(request: Request, response: Response): Promise<ControllerResponse> {
    const loginUserBodyDto = RecordToInstanceTransformer.transform(request.body, LoginUserBodyDto);

    const loginUserData = RecordToInstanceTransformer.transform(loginUserBodyDto, LoginUserData);

    const token = await this.userService.loginUser(loginUserData);

    const responseData = new LoginUserResponseData(token);

    return new LoginUserResponseDto(responseData, StatusCodes.OK);
  }

  public async setUserPassword(request: Request, response: Response): Promise<ControllerResponse> {
    const setUserPasswordBodyDto = RecordToInstanceTransformer.transform(request.body, SetUserPasswordBodyDto);

    const { userId, password } = setUserPasswordBodyDto;

    await this.userService.setPassword(userId, password);

    return new SetUserPasswordResponseDto(StatusCodes.NO_CONTENT);
  }

  public async findUser(request: Request, response: Response): Promise<ControllerResponse> {
    const { id } = RecordToInstanceTransformer.transform(request.params, FindUserParamDto);

    const userDto = await this.userService.findUser(id);

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
    const { id } = RecordToInstanceTransformer.transform(request.params, RemoveUserParamDto);

    await this.userService.removeUser(id);

    return new RemoveUserResponseDto(StatusCodes.NO_CONTENT);
  }
}
