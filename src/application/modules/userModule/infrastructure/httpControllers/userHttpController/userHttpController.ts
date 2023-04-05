import { DeleteUserResponseNoContentBody, deleteUserResponseNoContentBodySchema } from './schemas/deleteUserSchema';
import { FindUserResponseOkBody, findUserResponseOkBodySchema } from './schemas/findUserSchema';
import {
  LoginUserBody,
  LoginUserResponseOkBody,
  loginUserBodySchema,
  loginUserResponseOkBodySchema,
} from './schemas/loginUserSchema';
import {
  registerUserResponseCreatedBodySchema,
  RegisterUserBody,
  RegisterUserResponseCreatedBody,
  registerUserBodySchema,
} from './schemas/registerUserSchema';
import {
  SetUserEmailBody,
  SetUserEmailResponseOkBody,
  setUserEmailBodySchema,
  setUserEmailResponseOkBodySchema,
} from './schemas/setUserEmailSchema';
import {
  SetUserPasswordBody,
  SetUserPasswordResponseOkBody,
  setUserPasswordBodySchema,
  setUserPasswordResponseOkBodySchema,
} from './schemas/setUserPasswordSchema';
import {
  SetUserPhoneNumberBody,
  SetUserPhoneNumberResponseOkBody,
  setUserPhoneNumberBodySchema,
  setUserPhoneNumberResponseOkBodySchema,
} from './schemas/setUserPhoneNumberSchema';
import { AuthorizationType } from '../../../../../../common/http/authorizationType';
import { HttpController } from '../../../../../../common/http/httpController';
import { HttpMethodName } from '../../../../../../common/http/httpMethodName';
import { HttpRequest } from '../../../../../../common/http/httpRequest';
import {
  HttpCreatedResponse,
  HttpNoContentResponse,
  HttpNotFoundResponse,
  HttpOkResponse,
  HttpUnprocessableEntityResponse,
} from '../../../../../../common/http/httpResponse';
import { HttpRoute } from '../../../../../../common/http/httpRoute';
import { HttpStatusCode } from '../../../../../../common/http/httpStatusCode';
import { ResponseErrorBody, responseErrorBodySchema } from '../../../../../../common/http/responseErrorBodySchema';
import { Inject } from '../../../../../../libs/dependencyInjection/decorators';
import { UnitOfWorkFactory } from '../../../../../../libs/unitOfWork/factories/unitOfWorkFactory/unitOfWorkFactory';
import { unitOfWorkModuleSymbols } from '../../../../../../libs/unitOfWork/unitOfWorkModuleSymbols';
import { UserService } from '../../../application/services/userService/userService';
import { User } from '../../../domain/entities/user/user';
import { EmailAlreadySetError } from '../../../domain/errors/emailAlreadySetError';
import { PhoneNumberAlreadySetError } from '../../../domain/errors/phoneNumberAlreadySetError';
import { userModuleSymbols } from '../../../userModuleSymbols';
import { UserAlreadyExistsError } from '../../errors/userAlreadyExistsError';
import { UserNotFoundError } from '../../errors/userNotFoundError';

export class UserHttpController implements HttpController {
  public readonly basePath = 'users';

  public constructor(
    @Inject(unitOfWorkModuleSymbols.unitOfWorkFactory)
    private readonly unitOfWorkFactory: UnitOfWorkFactory,
    @Inject(userModuleSymbols.userService)
    private readonly userService: UserService,
  ) {}

  public getHttpRoutes(): HttpRoute[] {
    return [
      new HttpRoute({
        method: HttpMethodName.post,
        path: 'register',
        handler: this.registerUser.bind(this),
        schema: {
          request: {
            body: registerUserBodySchema,
          },
          response: {
            [HttpStatusCode.created]: {
              schema: registerUserResponseCreatedBodySchema,
            },
            [HttpStatusCode.unprocessableEntity]: {
              schema: responseErrorBodySchema,
            },
          },
        },
        authorizationType: AuthorizationType.bearerToken,
      }),
      new HttpRoute({
        method: HttpMethodName.post,
        path: 'login',
        handler: this.loginUser.bind(this),
        schema: {
          request: {
            body: loginUserBodySchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              schema: loginUserResponseOkBodySchema,
            },
            [HttpStatusCode.notFound]: {
              schema: responseErrorBodySchema,
            },
          },
        },
        authorizationType: AuthorizationType.bearerToken,
      }),
      new HttpRoute({
        method: HttpMethodName.post,
        path: 'set-password',
        handler: this.setUserPassword.bind(this),
        schema: {
          request: {
            body: setUserPasswordBodySchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              schema: setUserPasswordResponseOkBodySchema,
            },
            [HttpStatusCode.notFound]: {
              schema: responseErrorBodySchema,
            },
          },
        },
        authorizationType: AuthorizationType.bearerToken,
      }),
      new HttpRoute({
        method: HttpMethodName.post,
        path: 'set-email',
        handler: this.setUserEmail.bind(this),
        schema: {
          request: {
            body: setUserEmailBodySchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              schema: setUserEmailResponseOkBodySchema,
            },
            [HttpStatusCode.unprocessableEntity]: {
              schema: responseErrorBodySchema,
            },
            [HttpStatusCode.notFound]: {
              schema: responseErrorBodySchema,
            },
          },
        },
        authorizationType: AuthorizationType.bearerToken,
      }),
      new HttpRoute({
        method: HttpMethodName.post,
        path: 'set-phone-number',
        handler: this.setUserPhoneNumber.bind(this),
        schema: {
          request: {
            body: setUserPhoneNumberBodySchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              schema: setUserPhoneNumberResponseOkBodySchema,
            },
            [HttpStatusCode.unprocessableEntity]: {
              schema: responseErrorBodySchema,
            },
            [HttpStatusCode.notFound]: {
              schema: responseErrorBodySchema,
            },
          },
        },
        authorizationType: AuthorizationType.bearerToken,
      }),
      new HttpRoute({
        method: HttpMethodName.get,
        path: ':id',
        handler: this.findUser.bind(this),
        schema: {
          request: {},
          response: {
            [HttpStatusCode.ok]: {
              schema: findUserResponseOkBodySchema,
            },
            [HttpStatusCode.notFound]: {
              schema: responseErrorBodySchema,
            },
          },
        },
        authorizationType: AuthorizationType.bearerToken,
      }),
      new HttpRoute({
        method: HttpMethodName.delete,
        path: ':id',
        handler: this.deleteUser.bind(this),
        schema: {
          request: {},
          response: {
            [HttpStatusCode.noContent]: {
              schema: deleteUserResponseNoContentBodySchema,
            },
            [HttpStatusCode.notFound]: {
              schema: responseErrorBodySchema,
            },
          },
        },
        authorizationType: AuthorizationType.bearerToken,
      }),
    ];
  }

  private async registerUser(
    request: HttpRequest<RegisterUserBody>,
  ): Promise<
    HttpCreatedResponse<RegisterUserResponseCreatedBody> | HttpUnprocessableEntityResponse<ResponseErrorBody>
  > {
    const unitOfWork = await this.unitOfWorkFactory.create();

    let user: User | undefined;

    try {
      user = await unitOfWork.runInTransaction(async () => {
        if ('email' in request.body) {
          const { email, password } = request.body;

          return this.userService.registerUserByEmail({ unitOfWork, draft: { email, password } });
        } else {
          const { phoneNumber, password } = request.body;

          return this.userService.registerUserByPhoneNumber({ unitOfWork, draft: { phoneNumber, password } });
        }
      });
    } catch (error) {
      if (error instanceof UserAlreadyExistsError) {
        return { statusCode: HttpStatusCode.unprocessableEntity, body: { error } };
      }

      throw error;
    }

    return { statusCode: HttpStatusCode.created, body: { user } };
  }

  private async loginUser(
    request: HttpRequest<LoginUserBody>,
  ): Promise<HttpOkResponse<LoginUserResponseOkBody> | HttpNotFoundResponse<ResponseErrorBody>> {
    const unitOfWork = await this.unitOfWorkFactory.create();

    let token: string | undefined;

    try {
      token = await unitOfWork.runInTransaction(async () => {
        if ('email' in request.body) {
          const { email, password } = request.body;

          return this.userService.loginUserByEmail({ unitOfWork, draft: { email, password } });
        } else {
          const { phoneNumber, password } = request.body;

          return this.userService.loginUserByPhoneNumber({ unitOfWork, draft: { phoneNumber, password } });
        }
      });
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        return { statusCode: HttpStatusCode.notFound, body: { error } };
      }

      throw error;
    }

    return { statusCode: HttpStatusCode.ok, body: { token } };
  }

  private async setUserPassword(
    request: HttpRequest<SetUserPasswordBody, undefined, undefined>,
  ): Promise<HttpOkResponse<SetUserPasswordResponseOkBody> | HttpNotFoundResponse<ResponseErrorBody>> {
    const { userId } = request.context;

    const { password } = request.body;

    const unitOfWork = await this.unitOfWorkFactory.create();

    let user: User | undefined;

    try {
      await unitOfWork.runInTransaction(async () => {
        await this.userService.setUserPassword({ unitOfWork, userId: userId as string, password });
      });
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        return { statusCode: HttpStatusCode.notFound, body: { error } };
      }

      throw error;
    }

    return { statusCode: HttpStatusCode.ok, body: { user: user as User } };
  }

  private async setUserEmail(
    request: HttpRequest<SetUserEmailBody, undefined, undefined>,
  ): Promise<
    | HttpOkResponse<SetUserEmailResponseOkBody>
    | HttpNotFoundResponse<ResponseErrorBody>
    | HttpUnprocessableEntityResponse<ResponseErrorBody>
  > {
    const { userId } = request.context;

    const { email } = request.body;

    const unitOfWork = await this.unitOfWorkFactory.create();

    let user: User | undefined;

    try {
      await unitOfWork.runInTransaction(async () => {
        await this.userService.setUserEmail({ unitOfWork, userId: userId as string, email });
      });
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        return { statusCode: HttpStatusCode.notFound, body: { error } };
      }

      if (error instanceof EmailAlreadySetError) {
        return { statusCode: HttpStatusCode.unprocessableEntity, body: { error } };
      }

      throw error;
    }

    return { statusCode: HttpStatusCode.ok, body: { user: user as User } };
  }

  private async setUserPhoneNumber(
    request: HttpRequest<SetUserPhoneNumberBody, undefined, undefined>,
  ): Promise<
    | HttpOkResponse<SetUserPhoneNumberResponseOkBody>
    | HttpNotFoundResponse<ResponseErrorBody>
    | HttpUnprocessableEntityResponse<ResponseErrorBody>
  > {
    const { userId } = request.context;

    const { phoneNumber } = request.body;

    const unitOfWork = await this.unitOfWorkFactory.create();

    let user: User | undefined;

    try {
      await unitOfWork.runInTransaction(async () => {
        await this.userService.setUserPhoneNumber({ unitOfWork, userId: userId as string, phoneNumber });
      });
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        return { statusCode: HttpStatusCode.notFound, body: { error } };
      }

      if (error instanceof PhoneNumberAlreadySetError) {
        return { statusCode: HttpStatusCode.unprocessableEntity, body: { error } };
      }

      throw error;
    }

    return { statusCode: HttpStatusCode.ok, body: { user: user as User } };
  }

  private async findUser(
    request: HttpRequest<undefined, undefined, undefined>,
  ): Promise<HttpOkResponse<FindUserResponseOkBody> | HttpNotFoundResponse<ResponseErrorBody>> {
    const { userId } = request.context;

    const unitOfWork = await this.unitOfWorkFactory.create();

    let user: User | undefined;

    try {
      user = await unitOfWork.runInTransaction(async () => {
        return this.userService.findUser({ unitOfWork, userId: userId as string });
      });
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        return { statusCode: HttpStatusCode.notFound, body: { error } };
      }

      throw error;
    }

    return { statusCode: HttpStatusCode.ok, body: { user: user as User } };
  }

  private async deleteUser(
    request: HttpRequest<undefined, undefined, undefined>,
  ): Promise<HttpNoContentResponse<DeleteUserResponseNoContentBody> | HttpNotFoundResponse<ResponseErrorBody>> {
    const { userId } = request.context;

    const unitOfWork = await this.unitOfWorkFactory.create();

    try {
      await unitOfWork.runInTransaction(async () => {
        await this.userService.deleteUser({ unitOfWork, userId: userId as string });
      });
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        return { statusCode: HttpStatusCode.notFound, body: { error } };
      }

      throw error;
    }

    return { statusCode: HttpStatusCode.noContent, body: null };
  }
}
